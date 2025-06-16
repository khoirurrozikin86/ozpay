export interface Paket {
    nama: string;
    harga: number;
}

export interface Pelanggan {
    id: number;
    id_pelanggan: string;
    nama: string;
    paket?: Paket;
}
