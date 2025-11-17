<?php
include '../../db.php';
header('Content-Type: application/json');

$course_id = $_POST['course_id'] ?? null;
$prereq_id = $_POST['prereq_course_id'] ?? null;

if (!$course_id || !$prereq_id) {
    echo json_encode(["status" => "error", "message" => "Missing Course or Prerequisite ID."]);
    exit;
}

// 1. CHECK FOR EXISTING (DELETED or ACTIVE) RECORD
$check_stmt = $conn->prepare("SELECT prerequisite_id, is_deleted FROM tbl_course_prerequisite WHERE course_id = ? AND prereq_course_id = ?");
$check_stmt->bind_param("ii", $course_id, $prereq_id);
$check_stmt->execute();
$result = $check_stmt->get_result();
$existing_record = $result->fetch_assoc();
$check_stmt->close();

if ($existing_record) {
    if ($existing_record['is_deleted'] == 1) {
        $update_stmt = $conn->prepare("UPDATE tbl_course_prerequisite SET is_deleted = 0 WHERE prerequisite_id = ?");
        $update_stmt->bind_param("i", $existing_record['prerequisite_id']);

        if ($update_stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Prerequisite successfully restored."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to restore prerequisite: " . $update_stmt->error]);
        }
        $update_stmt->close();
    } else {
        echo json_encode(["status" => "error", "message" => "prerequisite already exist"]);
    }
} else {
    $insert_stmt = $conn->prepare("INSERT INTO tbl_course_prerequisite (course_id, prereq_course_id, is_deleted) VALUES (?, ?, 0)");
    $insert_stmt->bind_param("ii", $course_id, $prereq_id);

    if ($insert_stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Prerequisite added successfully!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error adding prerequisite: " . $insert_stmt->error]);
    }
    $insert_stmt->close();
}

$conn->close();
?>