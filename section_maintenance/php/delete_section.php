<?php
include '../../db.php';

header('Content-Type: application/json');

if(!isset($_GET['id'])){
    echo json_encode(["status" => "error", "message" => "No ID provided"]);
    exit;
}

$section_id = $_GET['id'];

// Soft delete: set is_deleted = 1 instead of removing the row
$stmt = $conn->prepare("UPDATE tbl_section SET is_deleted = 1 WHERE section_id = ?");
$stmt->bind_param("i", $section_id);

if($stmt->execute()){
    echo json_encode(["status" => "success", "message" => "Section deleted successfully (soft delete)."]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
