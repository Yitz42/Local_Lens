import CoreLocation
import Foundation

// These shapes match the JSON produced by ios/core-entry.js.

struct CoreInfo: Decodable {
    struct Category: Decodable, Hashable, Identifiable { let id, name, group: String }
    struct StoreType: Decodable, Hashable, Identifiable { let id, name: String }
    struct LocalLevel: Decodable, Hashable { let label, detail: String }
    let release: String
    let dataDate: String
    let checked: String
    let categories: [Category]
    let storeTypes: [StoreType]
    let localLevels: [LocalLevel]
    let defaultLocalLevel: Int
    let defaultHidden: [String]
}

struct LoadResult: Decodable {
    let count: Int
    let release: String
}

struct Ownership: Codable, Hashable {
    let type: String
    let label: String
    let brand: String
    let parent: String
    let note: String
    let source: String
    let sourceTitle: String
    let checked: String
    let localLabel: String
    let localNote: String
    let localCorporation: Bool
    let listing: String
    let listingCompany: String
    let matchLevel: String
}

struct Place: Codable, Hashable, Identifiable {
    let id: String
    let name: String
    let brand: String
    let lat: Double
    let lng: Double
    let category: String
    let categoryName: String
    let storeType: String
    let address: String
    let addressCity: String
    let website: String
    let cuisine: String
    let source: String
    let release: String
    var distance: Double
    let ownership: Ownership

    var coordinate: CLLocationCoordinate2D { CLLocationCoordinate2D(latitude: lat, longitude: lng) }
    var fullAddress: String { [address, addressCity].filter { !$0.isEmpty }.joined(separator: ", ") }
}

struct Brand: Decodable, Hashable, Identifiable {
    var id: String { brand }
    let brand: String
    let type: String
    let label: String
    let parent: String
    let note: String
    let source: String
    let sourceTitle: String
    let checked: String
    let aliases: [String]
    let localLabel: String
    let listing: String
}

/// Options for `filterPlaces` in public/ownership.js.
struct FilterOptions: Encodable {
    struct Origin: Encodable { let lat, lng: Double }
    let origin: Origin
    let radius: Double
    let category: String
    let storeType: String
    let hidden: [String]
    let localLevel: Int
    let sort: String
}

struct Area: Codable, Equatable {
    var name: String
    var lat: Double
    var lng: Double
    var coordinate: CLLocationCoordinate2D { CLLocationCoordinate2D(latitude: lat, longitude: lng) }
}
