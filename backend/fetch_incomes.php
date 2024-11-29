<?php
header('Content-Type: application/json');
include 'db_config.php';

// ambil parameter 'page' dan 'limit' dari request
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10; // default limit 10
$offset = ($page - 1) * $limit;

try {
    // Query untuk mengambil data dengan limit dan offset
    $query = "
    SELECT * FROM income ORDER BY id DESC LIMIT :limit OFFSET :offset
    ";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $incomes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // hitung total data untuk pagination
    $countQuery = "SELECT COUNT(*) as total FROM income";
    $countStmt = $conn->query($countQuery);
    $countStmt->execute();
    $totalData = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // struktur respons 
    $respons = [
        'data' => $incomes,
        'total' => $totalData,
        'page' => $page,
        'limit' => $limit
    ];

    echo json_encode($respons);
} catch (PDOException $e) {
    echo json_encode(["error" => "Gagal mengambil data: " . $e->getMessage()]);
}
?>