<?php
// Only show serious errors, no HTML warnings
error_reporting(E_ERROR | E_PARSE);
header('Content-Type: application/json');
include '../../db.php';

// Wrap everything in try/catch to ensure valid JSON response
try {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);

    $last_name = trim($data['last_name'] ?? '');
    $first_name = trim($data['first_name'] ?? '');
    $email = trim($data['email'] ?? '');
    $dept_id = isset($data['dept_id']) ? (int)$data['dept_id'] : 0;

    if ($last_name && $first_name && $email && $dept_id > 0) {
        $stmt = $conn->prepare(
            "INSERT INTO tbl_instructor (last_name, first_name, email, dept_id, is_deleted) 
             VALUES (?, ?, ?, ?, 0)"
        );
        $stmt->bind_param("sssi", $last_name, $first_name, $email, $dept_id);

        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Instructor added successfully']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to add instructor: ' . $stmt->error]);
        }

        $stmt->close();
    } else {
        echo json_encode(['status' => 'error', 'message' => 'All fields are required']);
    }

    $conn->close();

} catch (Exception $e) {
    // Catch any unexpected PHP errors and return JSON
    echo json_encode(['status' => 'error', 'message' => 'Server error: ' . $e->getMessage()]);
}
