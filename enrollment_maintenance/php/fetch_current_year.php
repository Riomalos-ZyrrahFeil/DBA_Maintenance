<?php
ob_start();

include '../../db.php';
header('Content-Type: application/json');

if ($conn->connect_error) {
    ob_end_clean();
    echo json_encode(["status" => "error", "message" => "Database connection failed: " . $conn->connect_error, "year" => (int)date('Y')]);
    exit;
}

$sql = "SELECT MAX(year) as current_year FROM tbl_term WHERE is_deleted = 0"; 
$result = $conn->query($sql);

$current_year = (int)date('Y');
$status = "error";
$message = "Could not fetch current year.";

if ($result) {
    if ($row = $result->fetch_assoc()) {
        $current_year = $row['current_year'] ?? $current_year;
        $status = "success";
        $message = "Current year fetched successfully.";
    } else {
        $status = "error";
        $message = "No terms found in database, using current calendar year.";
    }
} else {
    $status = "error";
    $message = "SQL Error during year fetch: " . $conn->error;
}

ob_end_clean();

echo json_encode(["status" => $status, "message" => $message, "year" => (int)$current_year]);

$conn->close();
?>
ini_set('display_errors', 'Off');