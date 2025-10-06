<?php
error_reporting(E_ERROR | E_PARSE);
header('Content-Type: application/json');
include '../../db.php';

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);

$id = $data['dept_id'] ?? '';
$code = $data['dept_code'] ?? '';
$name = $data['dept_name'] ?? '';

if ($id && $code && $name) {
    $stmt = $conn->prepare("UPDATE tbl_department SET dept_code=?, dept_name=? WHERE dept_id=?");
    $stmt->bind_param("ssi", $code, $name, $id);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Department updated successfully."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update department."]);
    }

    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "All fields are required."]);
}
