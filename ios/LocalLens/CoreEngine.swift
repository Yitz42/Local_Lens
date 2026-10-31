import Foundation
import JavaScriptCore

/// Runs the website's place lookup and ownership rules (ios/core-entry.js, bundled as local-lens-core.js)
/// in JavaScriptCore, so the app labels places exactly like the website. Every call into JavaScript
/// happens on `queue`; Swift supplies the byte-range reads of the Overture archive.
final class CoreEngine: @unchecked Sendable {
    enum CoreError: LocalizedError {
        case missingBundle
        case script(String)
        var errorDescription: String? {
            switch self {
            case .missingBundle: "The app was built without local-lens-core.js."
            case .script(let message): message
            }
        }
    }

    private let queue = DispatchQueue(label: "LocalLens.core")
    private let session: URLSession
    private var context: JSContext!
    private var core: JSValue!

    init() throws {
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = 15
        configuration.urlCache = URLCache(memoryCapacity: 16 << 20, diskCapacity: 128 << 20)
        session = URLSession(configuration: configuration)
        guard let url = Bundle.main.url(forResource: "local-lens-core", withExtension: "js") else { throw CoreError.missingBundle }
        let script = try String(contentsOf: url, encoding: .utf8)
        var failure: String?
        queue.sync {
            context = JSContext(virtualMachine: JSVirtualMachine())
            context.exceptionHandler = { _, exception in
                failure = exception?.toString()
                print("Local Lens core:", exception?.toString() ?? "unknown error")
            }
            let log: @convention(block) (String) -> Void = { print("Local Lens core:", $0) }
            let console = JSValue(newObjectIn: context)
            for name in ["log", "warn", "error"] { console?.setObject(log, forKeyedSubscript: name as NSString) }
            context.setObject(console, forKeyedSubscript: "console" as NSString)
            context.setObject(getBytesBlock(), forKeyedSubscript: "__nativeGetBytes" as NSString)
            context.evaluateScript(script, withSourceURL: url)
            core = context.objectForKeyedSubscript("LocalLensCore")
        }
        if let failure { throw CoreError.script(failure) }
    }

    /// Reads `length` bytes at `offset` and resolves the JavaScript promise with an ArrayBuffer.
    private func getBytesBlock() -> @convention(block) (String, Double, Double, JSValue, JSValue) -> Void {
        return { [unowned self] urlString, offset, length, resolve, reject in
            guard let url = URL(string: urlString) else { reject.call(withArguments: ["Invalid archive address"]); return }
            var request = URLRequest(url: url)
            request.setValue("bytes=\(Int(offset))-\(Int(offset + length) - 1)", forHTTPHeaderField: "Range")
            session.dataTask(with: request) { data, response, error in
                self.queue.async {
                    let status = (response as? HTTPURLResponse)?.statusCode ?? 0
                    guard let data, error == nil, (200..<300).contains(status) else {
                        reject.call(withArguments: [error?.localizedDescription ?? "Place data request failed (HTTP \(status))."])
                        return
                    }
                    resolve.call(withArguments: [self.arrayBuffer(data)])
                }
            }.resume()
        }
    }

    private func arrayBuffer(_ data: Data) -> JSValue {
        let bytes = UnsafeMutableRawPointer.allocate(byteCount: max(data.count, 1), alignment: 1)
        data.copyBytes(to: bytes.assumingMemoryBound(to: UInt8.self), count: data.count)
        let buffer = JSObjectMakeArrayBufferWithBytesNoCopy(context.jsGlobalContextRef, bytes, data.count, { bytes, _ in bytes?.deallocate() }, nil, nil)
        return JSValue(jsValueRef: buffer, in: context)
    }

    private func call<T: Decodable>(_ method: String, _ arguments: [Any]) async throws -> T {
        let json: String? = await withCheckedContinuation { continuation in
            queue.async { continuation.resume(returning: self.core.invokeMethod(method, withArguments: arguments)?.toString()) }
        }
        guard let json, let data = json.data(using: .utf8) else { throw CoreError.script("No answer from \(method).") }
        return try JSONDecoder().decode(T.self, from: data)
    }

    func info() async throws -> CoreInfo { try await call("info", []) }

    func filter(_ options: FilterOptions) async throws -> [Place] {
        let json = String(decoding: try JSONEncoder().encode(options), as: UTF8.self)
        return try await call("filter", [json])
    }

    func brands(query: String, type: String) async throws -> [Brand] { try await call("brands", [query, type]) }

    /// Loads every place within `radius` meters. `progress` reports finished and total pages.
    func load(lat: Double, lng: Double, radius: Int, progress: @escaping @Sendable (Int, Int) -> Void) async throws -> LoadResult {
        try await withCheckedThrowingContinuation { continuation in
            queue.async {
                let onProgress: @convention(block) (Int, Int) -> Void = { done, total in progress(done, total) }
                let onDone: @convention(block) (String) -> Void = { json in
                    do { continuation.resume(returning: try JSONDecoder().decode(LoadResult.self, from: Data(json.utf8))) }
                    catch { continuation.resume(throwing: error) }
                }
                let onError: @convention(block) (String) -> Void = { continuation.resume(throwing: CoreError.script($0)) }
                self.core.invokeMethod("load", withArguments: [lat, lng, radius, onProgress, onDone, onError])
            }
        }
    }
}
