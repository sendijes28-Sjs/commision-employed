export class PricingService {
  /**
   * Menghitung persentase penurunan harga dari harga normal
   */
  static calculateDropPercentage(normalPrice: number, sellingPrice: number): number {
    if (!normalPrice || normalPrice <= 0) return 0;
    const drop = normalPrice - sellingPrice;
    if (drop <= 0) return 0;
    return (drop / normalPrice) * 100;
  }

  /**
   * Menentukan flag warna berdasarkan aturan toleransi
   * 0-2%: Green
   * 3-5%: Yellow
   * 6-8%: Red
   * >8%: Reject
   */
  static getFlagColor(normalPrice: number, sellingPrice: number): 'green' | 'yellow' | 'red' | 'reject' | 'none' {
    if (!normalPrice || normalPrice <= 0) return 'none';
    
    // Jika harga jual lebih tinggi atau sama dengan normal, selalu hijau
    if (sellingPrice >= normalPrice) return 'green';

    const percentage = this.calculateDropPercentage(normalPrice, sellingPrice);

    if (percentage <= 2) return 'green';
    if (percentage <= 5) return 'yellow';
    if (percentage <= 8) return 'red';
    return 'reject';
  }

  /**
   * Mengecek apakah harga diizinkan berdasarkan aturan 8%
   */
  static isPriceAllowed(normalPrice: number, sellingPrice: number): boolean {
    if (!normalPrice || normalPrice <= 0) return true; // Biarkan jika data master tidak ada (tanggung jawab admin)
    const percentage = this.calculateDropPercentage(normalPrice, sellingPrice);
    return percentage <= 8;
  }
}
