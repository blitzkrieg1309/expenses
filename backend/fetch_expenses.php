<?php
header('Content-Type: application/json');
include 'db_config.php';

// Ambil parameter `page` dan `limit` dari request
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10; // Default 10 data per halaman
$offset = ($page - 1) * $limit;

try {
    // Query untuk mengambil data dengan limit dan offset
    $query = "
        SELECT * FROM expenses ORDER BY id DESC LIMIT :limit OFFSET :offset
    ";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Hitung total data untuk pagination
    $countQuery = "SELECT COUNT(*) as total FROM expenses";
    $countStmt = $conn->prepare($countQuery);
    $countStmt->execute();
    $totalData = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Struktur respons dengan pagination
    $response = [
        'data' => $expenses,
        'total' => $totalData, // Total data untuk menghitung jumlah halaman
        'page' => $page,       // Halaman saat ini
        'limit' => $limit      // Jumlah data per halaman
    ];

    echo json_encode($response);
} catch (PDOException $e) {
    echo json_encode(["error" => "Gagal mengambil data: " . $e->getMessage()]);
}
?>
