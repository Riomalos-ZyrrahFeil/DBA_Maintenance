<?php
include '../../db.php';

$raw = file_get_contents("php://input");
error_log("RAW INPUT: " . $raw);
$data = json_decode($raw, true);
error_log("JSON DECODE: " . print_r($data, true));

$last_name = $data['last_name'] ?? '';
$first_name = $data['first_name'] ?? '';
$email = $data['email'] ?? '';
$dept_id = isset($data['dept_id']) ? (int)$data['dept_id'] : 0;

// check values
if ($last_name && $first_name && $email && $dept_id > 0) {
    $stmt = $conn->prepare("INSERT INTO tbl_instructor (last_name, first_name, email, dept_id, is_deleted) VALUES (?, ?, ?, ?, 0)");
    $stmt->bind_param("sssi", $last_name, $first_name, $email, $dept_id);

    if ($stmt->execute()) {
        echo json_encode(['status'=> 'success', 'message'=> 'Instructor added successfully']);
    } else {
        echo json_encode(['status'=> 'error', 'message'=> 'Failed to add instructor: ' . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode([
        'status'=> 'error', 
        'message'=> 'All fields are required',
        'debug' => $data
    ]);
}
?>
