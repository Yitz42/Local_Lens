import SwiftUI

/// The reviewed brand directory (data/brands.json), searchable by brand, parent, alias, investor, or ticker.
struct BrandDirectoryView: View {
    @Environment(PlaceStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var query = ""
    @State private var type = "all"
    @State private var brands: [Brand] = []

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Picker("Ownership", selection: $type) {
                        Text("All").tag("all")
                        Text("Corporate").tag("corporate")
                        Text("Private equity").tag("pe")
                        Text("Locally run").tag("local")
                    }
                    .pickerStyle(.segmented)
                    .listRowBackground(Color.clear)
                    .listRowInsets(EdgeInsets())
                }
                Section {
                    ForEach(brands) { brand in
                        NavigationLink(value: brand) {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(brand.brand).font(.body.weight(.medium))
                                Text(brand.parent).font(.caption).foregroundStyle(.secondary).lineLimit(1)
                                Text(brand.label).font(.caption.weight(.semibold)).foregroundStyle(OwnershipStyle.color(brand.type))
                            }
                        }
                    }
                } header: {
                    Text("\(brands.count) brands")
                }
            }
            .searchable(text: $query, prompt: "Brand, parent, investor, or ticker")
            .task(id: "\(type)|\(query)") { brands = await store.brands(query: query, type: type) }
            .navigationDestination(for: Brand.self) { BrandDetailView(brand: $0) }
            .navigationTitle("Brand directory")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) { Button("Done") { dismiss() } }
            }
        }
    }
}

struct BrandDetailView: View {
    let brand: Brand

    var body: some View {
        List {
            Section {
                VStack(alignment: .leading, spacing: 8) {
                    Text(brand.brand).font(.title2.bold())
                    Text(brand.label)
                        .font(.caption.weight(.semibold))
                        .padding(.horizontal, 8).padding(.vertical, 4)
                        .foregroundStyle(.white)
                        .background(OwnershipStyle.color(brand.type), in: Capsule())
                }
            }
            Section("Ownership") {
                if !brand.parent.isEmpty { LabeledContent(brand.type == "pe" ? "Backed by" : "Parent", value: brand.parent) }
                if !brand.listing.isEmpty { LabeledContent("Publicly traded", value: brand.listing) }
                if !brand.localLabel.isEmpty { LabeledContent("Locations", value: brand.localLabel) }
                Text(brand.note).font(.subheadline)
                if let url = URL(string: brand.source), !brand.source.isEmpty {
                    Link(destination: url) { Label(brand.sourceTitle.isEmpty ? "Source" : brand.sourceTitle, systemImage: "doc.text.magnifyingglass") }
                }
                if !brand.checked.isEmpty { LabeledContent("Reviewed", value: brand.checked) }
            }
            if !brand.aliases.isEmpty {
                Section("Also matches") { Text(brand.aliases.joined(separator: ", ")).font(.subheadline) }
            }
        }
        .navigationTitle(brand.brand)
        .navigationBarTitleDisplayMode(.inline)
    }
}
