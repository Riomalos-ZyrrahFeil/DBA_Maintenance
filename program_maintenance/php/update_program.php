<?php
header("Content-Type: application/json");
include '../../db.php';

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['program_id'] ?? '';
$code = trim($data['program_code'] ?? '');
$name = trim($data['program_name'] ?? '');
$dept = $data['dept_id'] ?? '';

if (!$id || !$code || !$name || !$dept) {
    echo json_encode(["status" => "error", "message" => "Missing fields!"]);
    exit;
}

$sql = "UPDATE tbl_program SET program_code=?, program_name=?, dept_id=? WHERE program_id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssii", $code, $name, $dept, $id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "✅ Program updated successfully!"]);
} else {
    echo json_encode(["status" => "error", "message" => "❌ Update failed: " . $conn->error]);
}

$stmt->close();
$conn->close();
?>
