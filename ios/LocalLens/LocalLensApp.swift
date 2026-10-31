import SwiftUI

@main
struct LocalLensApp: App {
    @State private var store = PlaceStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(store)
                .tint(.lensGreen)
        }
    }
}
