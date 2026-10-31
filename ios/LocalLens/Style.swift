import SwiftUI

// Colors and icons matching public/style.css and the website's category icons.

extension Color {
    init(hex: UInt32) {
        self.init(red: Double(hex >> 16 & 0xff) / 255, green: Double(hex >> 8 & 0xff) / 255, blue: Double(hex & 0xff) / 255)
    }
    static let lensGreen = Color(hex: 0x284f3d)
}

enum OwnershipStyle {
    static func color(_ type: String) -> Color {
        switch type {
        case "independent": Color(hex: 0x487252)
        case "corporate": Color(hex: 0xb57842)
        case "pe": Color(hex: 0x8b6b9a)
        default: Color(hex: 0x7e8886)
        }
    }

    static func symbol(_ type: String) -> String {
        switch type {
        case "independent": "house.fill"
        case "corporate": "building.2.fill"
        case "pe": "chart.line.uptrend.xyaxis"
        default: "questionmark"
        }
    }

    static let legend: [(type: String, label: String)] = [("independent", "Independent / co-op"), ("corporate", "Corporate"), ("pe", "Private equity"), ("unknown", "Unknown")]
}

enum CategoryStyle {
    static func symbol(_ id: String) -> String {
        switch id {
        case "restaurant": "fork.knife"
        case "bar": "wineglass"
        case "coffee": "cup.and.saucer"
        case "grocery": "cart"
        case "home": "hammer"
        case "apparel": "tshirt"
        case "general": "bag"
        case "other": "storefront"
        case "gas": "fuelpump"
        case "cars": "car"
        case "phone": "iphone"
        case "auto": "wrench.and.screwdriver"
        case "carwash": "car.side.and.exclamationmark"
        case "beauty": "scissors"
        case "fitness": "figure.run"
        case "bank": "building.columns"
        case "print": "printer"
        case "laundry": "washer"
        case "childcare": "figure.and.child.holdinghands"
        case "pets": "pawprint"
        case "homeservices": "house.and.flag"
        case "repair": "screwdriver"
        case "storage": "shippingbox"
        case "money": "dollarsign.circle"
        case "realestate": "key"
        case "funeral": "leaf"
        case "hospital": "cross.case"
        case "pharmacy": "pills"
        case "clinic": "stethoscope"
        case "specialists": "heart.text.square"
        case "mental": "brain.head.profile"
        case "dental": "mouth"
        case "lab": "testtube.2"
        case "hearing": "ear"
        case "therapy": "figure.walk"
        case "senior": "figure.2"
        case "eye": "eyeglasses"
        case "hotel": "bed.double"
        case "fun": "popcorn"
        default: "square.grid.2x2"
        }
    }
}

struct OwnershipBadge: View {
    let ownership: Ownership
    var body: some View {
        Label(ownership.label, systemImage: OwnershipStyle.symbol(ownership.type))
            .font(.caption.weight(.semibold))
            .padding(.horizontal, 8).padding(.vertical, 4)
            .foregroundStyle(.white)
            .background(OwnershipStyle.color(ownership.type), in: Capsule())
    }
}

func distanceText(_ meters: Double) -> String {
    let miles = meters / 1609.344
    return miles < 0.1 ? "\(Int((meters * 3.28084 / 10).rounded() * 10)) ft" : String(format: miles < 10 ? "%.1f mi" : "%.0f mi", miles)
}
