import MapKit
import SwiftUI

struct PlaceDetailView: View {
    @Environment(PlaceStore.self) private var store
    let place: Place

    private var ownership: Ownership { place.ownership }

    var body: some View {
        List {
            Section {
                VStack(alignment: .leading, spacing: 8) {
                    Text(place.name).font(.title2.bold())
                    Text([place.cuisine.isEmpty ? place.categoryName : place.cuisine, place.storeType, distanceText(place.distance)].filter { !$0.isEmpty }.joined(separator: " · "))
                        .foregroundStyle(.secondary)
                    if !place.fullAddress.isEmpty { Text(place.fullAddress).font(.subheadline) }
                    OwnershipBadge(ownership: ownership)
                }
                .padding(.vertical, 4)
            }

            Section("Ownership") {
                if !ownership.parent.isEmpty { LabeledContent(ownership.type == "pe" ? "Backed by" : "Parent", value: ownership.parent) }
                if !ownership.brand.isEmpty && ownership.brand != place.name { LabeledContent("Matched brand", value: ownership.brand) }
                if !ownership.listing.isEmpty {
                    LabeledContent("Publicly traded", value: [ownership.listingCompany, ownership.listing].filter { !$0.isEmpty }.joined(separator: " · "))
                }
                if ownership.localCorporation {
                    Label("Headquartered within 150 miles: a regional or local corporation.", systemImage: "mappin.and.ellipse").font(.subheadline)
                }
                if !ownership.localLabel.isEmpty {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(ownership.localLabel).font(.subheadline.weight(.semibold))
                        Text(ownership.localNote).font(.subheadline).foregroundStyle(.secondary)
                    }
                }
                Text(ownership.note).font(.subheadline)
                if let url = URL(string: ownership.source), !ownership.source.isEmpty {
                    Link(destination: url) {
                        Label(ownership.sourceTitle.isEmpty ? "Source" : ownership.sourceTitle, systemImage: "doc.text.magnifyingglass")
                    }
                }
                if !ownership.checked.isEmpty { LabeledContent("Reviewed", value: ownership.checked) }
                if let url = store.correctionURL(for: place) {
                    Link(destination: url) { Label("Wrong label? Tell us", systemImage: "flag") }
                }
            }

            Section {
                Button("Open in Maps", systemImage: "map") {
                    let item = MKMapItem(placemark: MKPlacemark(coordinate: place.coordinate))
                    item.name = place.name
                    item.openInMaps()
                }
                if let url = URL(string: place.website), !place.website.isEmpty {
                    Link(destination: url) { Label("Website", systemImage: "safari") }
                }
            } footer: {
                Text("Listing from \(place.source.isEmpty ? "map data" : place.source)\(place.release.isEmpty ? "" : " (\(place.release))"). Brand ownership is not proof of who owns a particular location.")
            }
        }
        .navigationTitle(place.name)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            Button {
                store.toggleSaved(place)
            } label: {
                Label(store.isSaved(place) ? "Saved" : "Save", systemImage: store.isSaved(place) ? "star.fill" : "star")
            }
        }
    }
}
