<?php
include '../../db.php';
header('Content-Type: application/json');

// Optional: enable errors temporarily for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Read JSON input
$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON input']);
    exit;
}

// Validate required fields
$required = ['section_id','course_id','term_id','instructor_id','room_id','section_code','year','day_pattern','start_time','end_time','max_capacity'];
foreach($required as $field){
    if(!isset($data[$field]) || $data[$field] === ''){
        echo json_encode(["status"=>"error","message"=>"Missing field: $field"]);
        exit;
    }
}

// Assign variables with proper types
$section_id = intval($data['section_id']);
$course_id = intval($data['course_id']);
$term_id = intval($data['term_id']);
$instructor_id = intval($data['instructor_id']);
$room_id = intval($data['room_id']);
$section_code = $data['section_code'];
$year = intval($data['year']);
$day_pattern = $data['day_pattern'];
$start_time = $data['start_time'];
$end_time = $data['end_time'];
$max_capacity = intval($data['max_capacity']);

// Prepare and execute statement
$stmt = $conn->prepare("UPDATE tbl_section 
    SET course_id=?, term_id=?, instructor_id=?, room_id=?, section_code=?, year=?, day_pattern=?, start_time=?, end_time=?, max_capacity=? 
    WHERE section_id=?");

$stmt->bind_param(
    "iiiisssssii",
    $course_id,
    $term_id,
    $instructor_id,
    $room_id,
    $section_code,
    $year,
    $day_pattern,
    $start_time,
    $end_time,
    $max_capacity,
    $section_id
);

if($stmt->execute()){
    echo json_encode(["status" => "success", "message" => "Section updated successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
