<?php
include 'db_config.php';

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'];

try {
    $query = "DELETE FROM income WHERE id = :id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();

    echo json_encode(['Message' => 'Income deleted successfully']);
} catch (PDOException $e) {
    echo json_encode(['Message' => 'Error deleting income']);
}

?>