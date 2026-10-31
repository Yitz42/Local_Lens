import CoreLocation
import Foundation
import Observation

/// App state: the searched area, filters, results, and saved places. Filters, the last area, and saved
/// places are kept in UserDefaults on this device only, like the website's localStorage.
@MainActor @Observable
final class PlaceStore {
    enum Status: Equatable {
        case starting, welcome, loading(done: Int, total: Int), loaded, failed(String)
    }

    static let radiusOptions: [(meters: Int, label: String)] = [(805, "½ mi"), (1609, "1 mi"), (3219, "2 mi"), (8047, "5 mi"), (16093, "10 mi")]
    static let sortOptions: [(id: String, label: String)] = [("distance", "Nearest first"), ("name", "Name A–Z"), ("ownership", "Ownership")]
    static let exampleArea = Area(name: "Austin, Texas", lat: 30.2672, lng: -97.7431)
    /// The most places the map draws at once, so it stays responsive; the list shows all of them.
    static let mapLimit = 400

    private(set) var info: CoreInfo?
    private(set) var status: Status = .starting
    private(set) var area: Area?
    private(set) var places: [Place] = []
    private(set) var savedPlaces: [Place] = []
    private(set) var release = ""
    var message: String?

    var radius: Int { didSet { defaults.set(radius, forKey: "radius"); reloadArea() } }
    var category: String { didSet { defaults.set(category, forKey: "category"); if category != "other" { storeType = "all" }; refilter() } }
    var storeType: String { didSet { defaults.set(storeType, forKey: "storeType"); refilter() } }
    var hidden: Set<String> { didSet { defaults.set(Array(hidden), forKey: "hidden"); refilter() } }
    var localLevel: Int { didSet { defaults.set(localLevel, forKey: "localLevel"); refilter() } }
    var sort: String { didSet { defaults.set(sort, forKey: "sort"); refilter() } }
    var showingSaved = false { didSet { refilter() } }

    private var engine: CoreEngine?
    private let location = LocationProvider()
    private let defaults = UserDefaults.standard
    private var loadedKey = ""
    private var filterTask: Task<Void, Never>?

    init() {
        radius = defaults.object(forKey: "radius") as? Int ?? 3219
        category = defaults.string(forKey: "category") ?? "all"
        storeType = defaults.string(forKey: "storeType") ?? "all"
        hidden = Set(defaults.stringArray(forKey: "hidden") ?? ["pe", "corporate"])
        localLevel = defaults.object(forKey: "localLevel") as? Int ?? 1
        sort = defaults.string(forKey: "sort") ?? "distance"
        area = decode(Area.self, "area")
        savedPlaces = decode([Place].self, "saved") ?? []
    }

    func start() async {
        guard engine == nil else { return }
        do {
            let engine = try CoreEngine()
            self.engine = engine
            info = try await engine.info()
            release = info?.release ?? ""
        } catch {
            status = .failed(error.localizedDescription)
            return
        }
        if let area { await search(area) } else { status = .welcome }
    }

    // MARK: Searching

    func useMyLocation() async {
        do {
            let here = try await location.currentLocation().coordinate
            await search(Area(name: "Current location", lat: here.latitude, lng: here.longitude))
        } catch {
            message = error.localizedDescription
        }
    }

    func searchPlace(named query: String) async {
        let query = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !query.isEmpty else { return }
        do { await search(try await location.search(query, near: area?.coordinate)) }
        catch { message = error.localizedDescription }
    }

    func search(_ area: Area) async {
        guard let engine else { return }
        // Coordinates are rounded to three decimal places (about 100 m) before loading, like the website.
        let rounded = Area(name: area.name, lat: (area.lat * 1000).rounded() / 1000, lng: (area.lng * 1000).rounded() / 1000)
        self.area = rounded
        save(rounded, "area")
        showingSaved = false
        let key = "\(rounded.lat),\(rounded.lng),\(radius)"
        loadedKey = key
        status = .loading(done: 0, total: 1)
        do {
            let result = try await engine.load(lat: rounded.lat, lng: rounded.lng, radius: radius) { [weak self] done, total in
                Task { @MainActor in
                    guard let self, self.loadedKey == key, case .loading = self.status else { return }
                    self.status = .loading(done: done, total: total)
                }
            }
            guard loadedKey == key else { return }
            release = result.release
            await applyFilters()
            status = .loaded
        } catch {
            guard loadedKey == key else { return }
            status = .failed(error.localizedDescription)
        }
    }

    private func reloadArea() {
        guard let area, status != .starting, status != .welcome else { return }
        Task { await search(area) }
    }

    // MARK: Filtering

    func refilter() {
        filterTask?.cancel()
        filterTask = Task { await applyFilters() }
    }

    private func applyFilters() async {
        if showingSaved {
            let origin = area.map { CLLocation(latitude: $0.lat, longitude: $0.lng) }
            places = savedPlaces.map { place in
                var place = place
                if let origin { place.distance = origin.distance(from: CLLocation(latitude: place.lat, longitude: place.lng)) }
                return place
            }.sorted { sort == "name" ? $0.name < $1.name : $0.distance < $1.distance }
            return
        }
        guard let engine, let area else { return }
        let options = FilterOptions(origin: .init(lat: area.lat, lng: area.lng), radius: Double(radius), category: category,
                                    storeType: storeType, hidden: Array(hidden).sorted(), localLevel: localLevel, sort: sort)
        do {
            let result = try await engine.filter(options)
            if !Task.isCancelled { places = result }
        } catch {
            message = error.localizedDescription
        }
    }

    func isHidden(_ type: String) -> Bool { hidden.contains(type) }
    func setHidden(_ type: String, _ hide: Bool) { if hide { hidden.insert(type) } else { hidden.remove(type) } }

    var categoryName: String { info?.categories.first { $0.id == category }?.name ?? "All places" }
    var activeFilterCount: Int { hidden.count + (category == "all" ? 0 : 1) }

    // MARK: Saved places

    func isSaved(_ place: Place) -> Bool { savedPlaces.contains { $0.id == place.id } }

    func toggleSaved(_ place: Place) {
        if let index = savedPlaces.firstIndex(where: { $0.id == place.id }) { savedPlaces.remove(at: index) }
        else { savedPlaces.append(place) }
        save(savedPlaces, "saved")
        if showingSaved { refilter() }
    }

    // MARK: Brand directory

    func brands(query: String, type: String) async -> [Brand] {
        (try? await engine?.brands(query: query, type: type)) ?? []
    }

    // MARK: Storage

    private func save<T: Encodable>(_ value: T, _ key: String) {
        if let data = try? JSONEncoder().encode(value) { defaults.set(data, forKey: key) }
    }

    private func decode<T: Decodable>(_ type: T.Type, _ key: String) -> T? {
        guard let data = defaults.data(forKey: key) else { return nil }
        return try? JSONDecoder().decode(type, from: data)
    }

    // MARK: Corrections

    /// Opens a prefilled GitHub issue (.github/ISSUE_TEMPLATE/label-correction.yml), like the website's
    /// "Wrong label? Tell us" link.
    func correctionURL(for place: Place) -> URL? {
        let labels = ["independent": "Independent / co-op", "corporate": "Corporate", "pe": "Private equity backed", "unknown": "Unknown ownership"]
        let o = place.ownership
        let placeText = [place.name, place.fullAddress, "Category: \(place.categoryName)",
                         String(format: "Location: %.5f, %.5f", place.lat, place.lng),
                         "Listing: \(place.source.isEmpty ? "map data" : place.source) (\(place.id))"].filter { !$0.isEmpty }.joined(separator: "\n")
        let current = [labels[o.type] ?? o.type, o.brand.isEmpty ? "" : "Matched brand: \(o.brand)",
                       o.parent.isEmpty ? "" : "Parent: \(o.parent)", o.source.isEmpty ? "" : "Source: \(o.source)"].filter { !$0.isEmpty }.joined(separator: "\n")
        var components = URLComponents(string: "https://github.com/Yitz42/Local_Lens/issues/new")
        components?.queryItems = [.init(name: "template", value: "label-correction.yml"), .init(name: "title", value: "Wrong label: \(place.name)"),
                                  .init(name: "place", value: placeText), .init(name: "current", value: current)]
        return components?.url
    }
}
