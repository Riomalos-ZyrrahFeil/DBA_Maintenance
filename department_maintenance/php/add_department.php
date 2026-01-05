<?php
error_reporting(E_ERROR | E_PARSE);
header('Content-Type: application/json');
include '../../db.php';

$data = json_decode(file_get_contents("php://input"), true);

$code = $data['dept_code'] ?? '';
$name = $data['dept_name'] ?? '';

if (empty($code) || empty($name)) {
    echo json_encode(["status" => "error", "message" => "All fields are required."]);
    exit;
}

// Insert record
$stmt = $conn->prepare("INSERT INTO tbl_department (dept_code, dept_name) VALUES (?, ?)");
$stmt->bind_param("ss", $code, $name);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Department added successfully."]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to add department."]);
}

$stmt->close();
$conn->close();
?>
