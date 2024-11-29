<?php

include 'db_config.php';

$data = json_decode(file_get_contents('php://input'), true);
$category = $data['category'];
$amount = $data['amount'];
$date = $data['date'];

try {
    $query = "INSERT INTO expenses (category, amount, date) VALUES (:category, :amount, :date)";
    $stmt = $conn->prepare($query);
    $stmt-> bindParam(':category', $category);
    $stmt-> bindParam(':amount', $amount);
    $stmt-> bindParam(':date', $date);
    $stmt->execute();

    echo json_encode(["message" => "Expense added successfully"]);
} catch (PDOException $e) {
    echo json_encode(["message" => "Error adding expense: " . $e->getMessage()]);
}

file_put_contents('debug.log', print_r($data, true));

?>