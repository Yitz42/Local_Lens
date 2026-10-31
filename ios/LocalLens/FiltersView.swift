import SwiftUI

struct FiltersView: View {
    @Environment(PlaceStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        @Bindable var store = store
        NavigationStack {
            Form {
                Section("Show") {
                    CategoryPicker()
                    if store.category == "other" { StoreTypePicker() }
                }

                Section {
                    Toggle("Private equity backed", isOn: binding("pe"))
                    Toggle("Corporate brands", isOn: binding("corporate"))
                    Toggle("Unknown ownership", isOn: binding("unknown"))
                } header: {
                    Text("Hide")
                } footer: {
                    Text("Corporate includes every reviewed publicly traded company. Unknown means a place hasn't been matched to the directory yet; it does not mean independent.")
                }

                if store.hidden.contains("pe") || store.hidden.contains("corporate"), let levels = store.info?.localLevels {
                    Section {
                        Picker("How local?", selection: $store.localLevel) {
                            ForEach(levels.indices, id: \.self) { index in
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(levels[index].label)
                                    Text(levels[index].detail).font(.caption).foregroundStyle(.secondary)
                                }
                                .tag(index)
                            }
                        }
                        .pickerStyle(.inline)
                        .labelsHidden()
                    } header: {
                        Text("How local?")
                    } footer: {
                        Text("Franchise and dealer locations have local owners, but most of the money still goes to the brand.")
                    }
                }

                Section("Search") {
                    Picker("Distance", selection: $store.radius) {
                        ForEach(PlaceStore.radiusOptions, id: \.meters) { Text($0.label).tag($0.meters) }
                    }
                    Picker("Sort", selection: $store.sort) {
                        ForEach(PlaceStore.sortOptions, id: \.id) { Text($0.label).tag($0.id) }
                    }
                }
            }
            .navigationTitle("Filters")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) { Button("Done") { dismiss() } }
            }
        }
    }

    private func binding(_ type: String) -> Binding<Bool> {
        Binding(get: { store.isHidden(type) }, set: { store.setHidden(type, $0) })
    }
}
