import MapKit
import SwiftUI

/// iPhone: a full-screen map with the results in a resizable sheet. iPad: results in a sidebar beside the map.
struct ContentView: View {
    @Environment(PlaceStore.self) private var store
    @Environment(\.horizontalSizeClass) private var sizeClass
    @State private var selection: String?
    @State private var path: [Place] = []
    @State private var detent: PresentationDetent = .medium

    var body: some View {
        Group {
            if sizeClass == .regular {
                NavigationSplitView {
                    ResultsPanel(path: $path)
                        .navigationSplitViewColumnWidth(min: 320, ideal: 380, max: 460)
                } detail: {
                    PlaceMap(selection: $selection)
                }
            } else {
                GeometryReader { geometry in
                    // Keep the searched area in the part of the map the results sheet leaves visible.
                    PlaceMap(selection: $selection)
                        .safeAreaPadding(.bottom, detent == .height(140) ? 140 : geometry.size.height * 0.45)
                }
                .sheet(isPresented: .constant(true)) {
                        ResultsPanel(path: $path)
                            .presentationDetents([.height(140), .medium, .large], selection: $detent)
                            .presentationBackgroundInteraction(.enabled(upThrough: .medium))
                            .presentationContentInteraction(.scrolls)
                            .interactiveDismissDisabled()
                    }
            }
        }
        .onChange(of: selection) {
            guard let selection, let place = store.places.first(where: { $0.id == selection }) else { return }
            path = [place]
            if detent == .height(140) { detent = .medium }
        }
        .onChange(of: path) {
            selection = path.last?.id
        }
        .task { await store.start() }
    }
}

struct PlaceMap: View {
    @Environment(PlaceStore.self) private var store
    @Binding var selection: String?
    @State private var position: MapCameraPosition = .automatic
    @State private var region: MKCoordinateRegion?

    private var center: CLLocationCoordinate2D? { region?.center }

    /// The places drawn on the map: those in view, thinned to one per grid cell (the first in the list's
    /// order) so dense blocks don't pile up. Zooming in shows more of them.
    private var mapPlaces: [Place] {
        guard let region else { return Array(store.places.prefix(PlaceStore.mapLimit)) }
        let span = region.span, cells = 18.0
        let minLat = region.center.latitude - span.latitudeDelta / 2, minLng = region.center.longitude - span.longitudeDelta / 2
        var taken = Set<Int>(), result: [Place] = []
        for place in store.places {
            let row = (place.lat - minLat) / span.latitudeDelta, column = (place.lng - minLng) / span.longitudeDelta
            guard (0...1).contains(row), (0...1).contains(column) else { continue }
            let cell = Int(row * cells) * 100 + Int(column * cells)
            if place.id == selection || taken.insert(cell).inserted { result.append(place) }
            if result.count >= PlaceStore.mapLimit { break }
        }
        return result
    }

    /// Offers a new search once the map has been moved well away from the searched area.
    private var movedAway: Bool {
        guard let center, let area = store.area, !store.showingSaved else { return false }
        let moved = CLLocation(latitude: center.latitude, longitude: center.longitude).distance(from: CLLocation(latitude: area.lat, longitude: area.lng))
        return moved > max(Double(store.radius) * 0.4, 300)
    }

    var body: some View {
        Map(position: $position, selection: $selection) {
            UserAnnotation()
            if let area = store.area, !store.showingSaved {
                MapCircle(center: area.coordinate, radius: Double(store.radius))
                    .foregroundStyle(Color.lensGreen.opacity(0.05))
                    .stroke(Color.lensGreen.opacity(0.45), lineWidth: 1)
            }
            ForEach(mapPlaces) { place in
                Annotation(place.name, coordinate: place.coordinate, anchor: .center) {
                    PlaceDot(place: place, selected: place.id == selection)
                }
                .annotationTitles(place.id == selection ? .automatic : .hidden)
                .tag(place.id)
            }
        }
        .mapStyle(.standard(pointsOfInterest: .excludingAll))
        .mapControls {
            MapUserLocationButton()
            MapCompass()
            MapScaleView()
        }
        .onMapCameraChange(frequency: .onEnd) { region = $0.region }
        .overlay(alignment: .top) {
            if movedAway, let center {
                Button {
                    Task { await store.search(Area(name: "Map area", lat: center.latitude, lng: center.longitude)) }
                } label: {
                    Label("Search this area", systemImage: "magnifyingglass")
                        .font(.subheadline.weight(.semibold))
                        .padding(.horizontal, 14).padding(.vertical, 9)
                }
                .buttonStyle(.plain)
                .foregroundStyle(.white)
                .background(Color.lensGreen, in: Capsule())
                .shadow(radius: 3)
                .padding(.top, 8)
            }
        }
        .overlay(alignment: .topLeading) { MapLegend().padding(10) }
        .onChange(of: store.area, initial: true) { frame() }
        .onChange(of: store.radius) { frame() }
    }

    private func frame() {
        guard let area = store.area else { return }
        let span = Double(store.radius) * 2.3
        withAnimation { position = .region(MKCoordinateRegion(center: area.coordinate, latitudinalMeters: span, longitudinalMeters: span)) }
    }
}

struct PlaceDot: View {
    let place: Place
    let selected: Bool

    var body: some View {
        Image(systemName: CategoryStyle.symbol(place.category))
            .font(.system(size: selected ? 15 : 9, weight: .bold))
            .foregroundStyle(.white)
            .frame(width: selected ? 34 : 20, height: selected ? 34 : 20)
            .background(OwnershipStyle.color(place.ownership.type), in: Circle())
            .overlay(Circle().stroke(.white, lineWidth: 1.5))
            .shadow(color: .black.opacity(0.25), radius: 1.5, y: 1)
            .animation(.snappy, value: selected)
    }
}

struct MapLegend: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            ForEach(OwnershipStyle.legend, id: \.type) { item in
                HStack(spacing: 5) {
                    Circle().fill(OwnershipStyle.color(item.type)).frame(width: 8, height: 8)
                    Text(item.label)
                }
            }
        }
        .font(.caption2)
        .padding(8)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8))
    }
}
