import SwiftUI

struct ResultsPanel: View {
    @Environment(PlaceStore.self) private var store
    @Binding var path: [Place]
    @State private var query = ""
    @State private var showFilters = false
    @State private var showBrands = false
    @State private var showAbout = false

    var body: some View {
        @Bindable var store = store
        NavigationStack(path: $path) {
            List {
                if !store.showingSaved {
                    Section {
                        HStack {
                            Image(systemName: "magnifyingglass").foregroundStyle(.secondary)
                            TextField("City, address, or ZIP", text: $query)
                                .textContentType(.fullStreetAddress)
                                .submitLabel(.search)
                                .onSubmit { Task { await store.searchPlace(named: query) } }
                            Button("Use my location", systemImage: "location.fill") { Task { await store.useMyLocation() } }
                                .labelStyle(.iconOnly)
                        }
                        CategoryPicker()
                        if store.category == "other" { StoreTypePicker() }
                    }
                }
                statusSection
                if showsResults {
                    Section {
                        ForEach(store.places) { place in
                            NavigationLink(value: place) { PlaceRow(place: place) }
                        }
                    } header: {
                        Text(summary)
                    } footer: {
                        Text(footer)
                    }
                }
            }
            .navigationTitle(store.showingSaved ? "Saved places" : store.area?.name ?? "Local Lens")
            .navigationBarTitleDisplayMode(.inline)
            .navigationDestination(for: Place.self) { PlaceDetailView(place: $0) }
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        store.showingSaved.toggle()
                    } label: {
                        Label("Saved", systemImage: store.showingSaved ? "star.fill" : "star")
                    }
                }
                ToolbarItemGroup(placement: .topBarTrailing) {
                    Button { showFilters = true } label: {
                        Label("Filters", systemImage: store.hidden.isEmpty ? "line.3.horizontal.decrease.circle" : "line.3.horizontal.decrease.circle.fill")
                    }
                    Menu {
                        Button("Brand directory", systemImage: "books.vertical") { showBrands = true }
                        Button("About the data", systemImage: "info.circle") { showAbout = true }
                    } label: {
                        Label("More", systemImage: "ellipsis.circle")
                    }
                }
            }
            .sheet(isPresented: $showFilters) { FiltersView() }
            .sheet(isPresented: $showBrands) { BrandDirectoryView() }
            .sheet(isPresented: $showAbout) { AboutView() }
            .alert("Local Lens", isPresented: Binding(get: { store.message != nil }, set: { if !$0 { store.message = nil } })) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(store.message ?? "")
            }
        }
    }

    private var showsResults: Bool {
        store.showingSaved || store.status == .loaded
    }

    @ViewBuilder private var statusSection: some View {
        if store.showingSaved {
            if store.savedPlaces.isEmpty {
                Section { Text("Places you save with the star appear here. They stay on this device.").foregroundStyle(.secondary) }
            }
        } else {
            switch store.status {
            case .starting:
                Section { ProgressView("Starting…") }
            case .welcome:
                Section {
                    Text("Find out who owns the places near you: independent and co-op stores, corporate brands, and private equity-backed chains.")
                    Button("Use my location", systemImage: "location.fill") { Task { await store.useMyLocation() } }
                    Button("Open an example area (\(PlaceStore.exampleArea.name))", systemImage: "map") { Task { await store.search(PlaceStore.exampleArea) } }
                }
            case .loading(let done, let total):
                Section {
                    ProgressView(value: Double(done), total: Double(max(total, 1))) {
                        Text("Loading places…")
                    } currentValueLabel: {
                        Text(total > 1 ? "\(done) of \(total) map areas" : "Contacting Overture Maps")
                    }
                }
            case .failed(let message):
                Section {
                    Label(message, systemImage: "exclamationmark.triangle").foregroundStyle(.red)
                    if let area = store.area { Button("Try again") { Task { await store.search(area) } } }
                }
            case .loaded:
                if store.places.isEmpty {
                    Section { Text("No places match. Try a larger radius, another category, or fewer hidden brands.").foregroundStyle(.secondary) }
                }
            }
        }
    }

    private var summary: String {
        let count = store.places.count
        let noun = count == 1 ? "place" : "places"
        if store.showingSaved { return "\(count) saved \(noun)" }
        let radius = PlaceStore.radiusOptions.first { $0.meters == store.radius }?.label ?? ""
        return "\(count) \(noun) within \(radius) · \(store.categoryName)"
    }

    private var footer: String {
        var parts: [String] = []
        let hidden = [("pe", "private equity"), ("corporate", "corporate"), ("unknown", "unknown")].filter { store.hidden.contains($0.0) }.map(\.1)
        if !hidden.isEmpty && !store.showingSaved { parts.append("Hiding \(ListFormatter.localizedString(byJoining: hidden)) places.") }
        if store.places.count > 200 { parts.append("Zoom in on the map to see more places.") }
        parts.append("Place data © Overture Maps Foundation (\(store.release)).")
        return parts.joined(separator: " ")
    }
}

struct PlaceRow: View {
    @Environment(PlaceStore.self) private var store
    let place: Place

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: CategoryStyle.symbol(place.category))
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(.white)
                .frame(width: 34, height: 34)
                .background(OwnershipStyle.color(place.ownership.type), in: Circle())
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 4) {
                    Text(place.name).font(.body.weight(.medium)).lineLimit(1)
                    if store.isSaved(place) { Image(systemName: "star.fill").font(.caption).foregroundStyle(.yellow) }
                }
                Text([place.cuisine.isEmpty ? place.categoryName : place.cuisine, distanceText(place.distance)].joined(separator: " · "))
                    .font(.caption).foregroundStyle(.secondary).lineLimit(1)
                Text(ownershipLine)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(OwnershipStyle.color(place.ownership.type))
                    .lineLimit(1)
            }
        }
    }

    private var ownershipLine: String {
        let o = place.ownership
        if o.type == "unknown" { return o.label }
        return [o.label, o.parent].filter { !$0.isEmpty }.joined(separator: " · ")
    }
}

struct CategoryPicker: View {
    @Environment(PlaceStore.self) private var store

    var body: some View {
        @Bindable var store = store
        let categories = store.info?.categories ?? []
        let groups = categories.reduce(into: [String]()) { if !$0.contains($1.group) { $0.append($1.group) } }
        Picker("Category", selection: $store.category) {
            ForEach(groups, id: \.self) { group in
                Section {
                    ForEach(categories.filter { $0.group == group }) { category in
                        Label(category.name, systemImage: CategoryStyle.symbol(category.id)).tag(category.id)
                    }
                } header: {
                    if !group.isEmpty { Text(group) }
                }
            }
        }
    }
}

struct StoreTypePicker: View {
    @Environment(PlaceStore.self) private var store

    var body: some View {
        @Bindable var store = store
        Picker("Store type", selection: $store.storeType) {
            Text("All stores").tag("all")
            ForEach(store.info?.storeTypes ?? []) { Text($0.name).tag($0.id) }
            Text("Everything else").tag("other")
        }
    }
}
