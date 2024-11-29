<?php

include 'db_config.php';

try {
    // Query expenses perhari
    $queryDaily = "
        SELECT date, SUM(AMOUNT) as total 
        FROM expenses 
        WHERE date >= CURRENT_DATE - INTERVAL '1 month' 
        GROUP BY date 
        ORDER BY date ASC
    ";
    $stmtDaily = $conn->prepare($queryDaily);
    $stmtDaily->execute();
    $dailyExpenses = $stmtDaily->fetchAll(PDO::FETCH_ASSOC);

    // Query expenses perbulan
    $queryMonthly = "
        SELECT TO_CHAR(date, 'YYYY-MM') as month, SUM(amount) as total 
        FROM expenses 
        WHERE date >= CURRENT_DATE - INTERVAL '1 year' 
        GROUP BY month 
        ORDER BY month ASC
    ";
    $stmtMonthly = $conn->prepare($queryMonthly);
    $stmtMonthly->execute();
    $monthlyExpenses = $stmtMonthly->fetchAll(PDO::FETCH_ASSOC);

    // Query expenses by category 
    $queryCategory = "
        select distinct category, SUM(amount) as total
        from expenses
        WHERE date >= CURRENT_DATE - INTERVAL '1 month'
        group	by category ;

    ";
    $stmtCategory = $conn->prepare($queryCategory);
    $stmtCategory->execute();
    $categoryExpenses = $stmtCategory->fetchAll(PDO::FETCH_ASSOC);

    // Gabungkan data
    $response = [
        'daily' => $dailyExpenses,
        'monthly' => $monthlyExpenses,
        'category' => $categoryExpenses
    ];

    header('Content-Type: application/json');
    echo json_encode($response);
} catch (PDOException $e) {
    echo json_encode(["error" => "Error fetching data". $e->getMessage()]);
}

?>