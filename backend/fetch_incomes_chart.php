<?php
include 'db_config.php';

try {
    // Query expenses perbulan
    $queryMonthly = "
        SELECT TO_CHAR(date, 'YYYY-MM') as month, SUM(amount) as total 
        FROM income 
        WHERE date >= CURRENT_DATE - INTERVAL '1 year' 
        GROUP BY month 
        ORDER BY month ASC
    ";
    $stmtMonthly = $conn->prepare($queryMonthly);
    $stmtMonthly->execute();
    $monthlyIncomes = $stmtMonthly->fetchAll(PDO::FETCH_ASSOC);

    $response = ['monthly' => $monthlyIncomes];

    header('Content-Type: application/json');
    echo json_encode($response);
} catch (PDOException $e) {
    echo json_encode(["error" => "Error fetching data".$e->getMessage()]);
} 
?>