<?php
header("Content-Type: application/json");

include "../../db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['dept_id'], $data['dept_code'], $data['dept_name']) ||
    empty($data['dept_code']) || empty($data['dept_name'])) {
    echo json_encode(["message" => "All fields are required."]);
    exit;
}

$dept_id = $data['dept_id'];
$dept_code = $data['dept_code'];
$dept_name = $data['dept_name'];

$stmt = $conn->prepare("UPDATE tbl_department SET dept_code = ?, dept_name = ? WHERE dept_id = ?");
$stmt->bind_param("ssi", $dept_code, $dept_name, $dept_id);

if ($stmt->execute()) {
    echo json_encode(["message" => "Department updated successfully!"]);
} else {
    echo json_encode(["message" => "Failed to update department."]);
}

$stmt->close();
$conn->close();
?>
