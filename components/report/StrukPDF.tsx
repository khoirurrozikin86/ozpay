import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 12,
        fontFamily: "Helvetica",
        lineHeight: 1.4,
    },
    header: {
        fontSize: 18,
        textAlign: "center",
        marginBottom: 4,
        fontWeight: "bold",
    },
    subheader: {
        fontSize: 14,
        textAlign: "center",
        marginBottom: 20,
    },
    table: {
        width: "100%",
        border: "1px solid #000",
        borderCollapse: "collapse",
    },
    row: {
        flexDirection: "row",
    },
    headerCell: {
        border: "1px solid #000",
        padding: 6,
        backgroundColor: "#f0f0f0",
        fontWeight: "bold",
        textAlign: "center",
    },
    cell: {
        border: "1px solid #000",
        padding: 6,
        textAlign: "center",
    },
    footer: {
        marginTop: 30,
        textAlign: "right",
        fontStyle: "italic",
        fontSize: 10,
    },
    // Tambahkan style khusus untuk kolom yang lebih lebar
    wideColumn: {
        flex: 3, // Lebih besar dari kolom lain
    },
    normalColumn: {
        flex: 1, // Ukuran normal untuk kolom lain
    },
});

export default function StrukPDF({ data }: { data: any }) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.header}>** STRUK PEMBAYARAN **</Text>
                <Text style={styles.subheader}>TAGIHAN LAYANAN OZ-NET</Text>

                <View style={styles.row}>
                    <Text style={[styles.headerCell, styles.wideColumn]}>Pelanggan</Text>
                    <Text style={[styles.headerCell, styles.normalColumn]}>Paket</Text>
                    <Text style={[styles.headerCell, styles.normalColumn]}>Period</Text>
                    <Text style={[styles.headerCell, styles.normalColumn]}>Tagihan</Text>
                    <Text style={[styles.headerCell, styles.normalColumn]}>Status</Text>
                    <Text style={[styles.headerCell, styles.normalColumn]}>Tgl Bayar</Text>
                    <Text style={[styles.headerCell, styles.normalColumn]}>Penerima</Text>
                </View>

                <View style={styles.row}>
                    <Text style={[styles.cell, styles.wideColumn]}>{data.pelanggan}</Text>
                    <Text style={[styles.cell, styles.normalColumn]}>{data.paket}</Text>
                    <Text style={[styles.cell, styles.normalColumn]}>{data.bulan} / {data.tahun}</Text>
                    <Text style={[styles.cell, styles.normalColumn]}>
                        {typeof data.jumlah_tagihan === "number"
                            ? `Rp ${data.jumlah_tagihan.toLocaleString("id-ID")}`
                            : data.jumlah_tagihan}
                    </Text>
                    <Text style={[styles.cell, styles.normalColumn]}>{data.status}</Text>
                    <Text style={[styles.cell, styles.normalColumn]}>{data.tgl_bayar}</Text>
                    <Text style={[styles.cell, styles.normalColumn]}>{data.penerima}</Text>
                </View>

                <Text style={styles.footer}>
                    Dicetak pada: {new Date().toLocaleDateString("id-ID", {
                        day: "2-digit", month: "short", year: "numeric"
                    })}
                </Text>
            </Page>
        </Document>
    );
}