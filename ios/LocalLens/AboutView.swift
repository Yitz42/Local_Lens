import SwiftUI

struct AboutView: View {
    @Environment(PlaceStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Text("Local Lens shows who owns nearby businesses: independent and co-op stores, corporate brands, and private equity-backed chains. It is a prototype; the ownership directory is researched and sourced but incomplete.")
                }
                Section("Data") {
                    LabeledContent("Places", value: "Overture Maps \(store.info?.release ?? "")")
                    LabeledContent("Ownership reviewed", value: store.info?.checked ?? "")
                    Text("Places are matched to the directory by reviewed brand names, never guessed. Unknown does not mean independent. Brand ownership and a particular store's owner can differ, especially for franchises.")
                        .font(.subheadline).foregroundStyle(.secondary)
                }
                Section("Privacy") {
                    Text("Your location, filters, and saved places stay on this device. Only an area rounded to about 100 meters is used to load place data from Overture Maps.")
                        .font(.subheadline)
                }
                Section("Links") {
                    Link("Source code and data on GitHub", destination: URL(string: "https://github.com/Yitz42/Local_Lens")!)
                    Link("Overture Maps attribution", destination: URL(string: "https://docs.overturemaps.org/attribution/")!)
                }
                Section {
                    Text("Place data © Overture Maps Foundation and its sources. Hospital ownership from the PE Hospital Tracker. Code: MIT No Attribution. Ownership data: CC0.")
                        .font(.footnote).foregroundStyle(.secondary)
                }
            }
            .navigationTitle("About the data")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) { Button("Done") { dismiss() } }
            }
        }
    }
}
