import SparkMD5 from "spark-md5"

/**
 * Computes an uppercase hex MD5 hash of file bytes, matching C# HashingExtensions.ToMd5Hash.
 */
export function computeMd5Hash(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data)
  if (bytes.length === 0) return ""

  const normalized = new Uint8Array(bytes)
  return SparkMD5.ArrayBuffer.hash(normalized.buffer).toUpperCase()
}
