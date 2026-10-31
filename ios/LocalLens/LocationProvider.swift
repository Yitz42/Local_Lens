import CoreLocation
import MapKit

/// One-shot access to the device location, plus place-name search through MapKit.
@MainActor
final class LocationProvider: NSObject, CLLocationManagerDelegate {
    enum LocationError: LocalizedError {
        case denied, unavailable, notFound
        var errorDescription: String? {
            switch self {
            case .denied: "Location access is off. Turn it on in Settings, or search for a place instead."
            case .unavailable: "Your location isn't available right now. Search for a place instead."
            case .notFound: "No matching place was found."
            }
        }
    }

    private let manager = CLLocationManager()
    private var waiting: [CheckedContinuation<CLLocation, Error>] = []

    override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyHundredMeters
    }

    func currentLocation() async throws -> CLLocation {
        switch manager.authorizationStatus {
        case .denied, .restricted: throw LocationError.denied
        default: break
        }
        return try await withCheckedThrowingContinuation { continuation in
            waiting.append(continuation)
            if manager.authorizationStatus == .notDetermined { manager.requestWhenInUseAuthorization() }
            else { manager.requestLocation() }
        }
    }

    /// Finds a place or address by name, preferring results near `near`.
    func search(_ query: String, near: CLLocationCoordinate2D?) async throws -> Area {
        let request = MKLocalSearch.Request()
        request.naturalLanguageQuery = query
        request.resultTypes = [.address, .pointOfInterest]
        if let near { request.region = MKCoordinateRegion(center: near, latitudinalMeters: 200_000, longitudinalMeters: 200_000) }
        guard let item = try await MKLocalSearch(request: request).start().mapItems.first else { throw LocationError.notFound }
        let coordinate = item.placemark.coordinate
        return Area(name: item.name ?? query, lat: coordinate.latitude, lng: coordinate.longitude)
    }

    private func finish(_ result: Result<CLLocation, Error>) {
        let continuations = waiting
        waiting.removeAll()
        for continuation in continuations { continuation.resume(with: result) }
    }

    nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        Task { @MainActor in
            guard !waiting.isEmpty else { return }
            switch manager.authorizationStatus {
            case .authorizedWhenInUse, .authorizedAlways: manager.requestLocation()
            case .denied, .restricted: finish(.failure(LocationError.denied))
            default: break
            }
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        Task { @MainActor in finish(.success(location)) }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        Task { @MainActor in finish(.failure(LocationError.unavailable)) }
    }
}
