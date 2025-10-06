<?php
include '../../db.php';
ini_set('display_errors', 1);
error_reporting(E_ALL); 
header('Content-Type: application/json');

// Optional: temporarily enable errors for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Read JSON input
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required = ['course_id','term_id','instructor_id','room_id','section_code','year','day_pattern','start_time','end_time','max_capacity'];
foreach($required as $field){
    if(!isset($data[$field])){
        echo json_encode(["status"=>"error","message"=>"Missing field: $field"]);
        exit;
    }
}

// Assign variables
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
$stmt = $conn->prepare("INSERT INTO tbl_section (course_id, term_id, instructor_id, room_id, section_code, year, day_pattern, start_time, end_time, max_capacity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("iiiissssii", $course_id, $term_id, $instructor_id, $room_id, $section_code, $year, $day_pattern, $start_time, $end_time, $max_capacity);

if($stmt->execute()){
    echo json_encode(["status"=>"success","message"=>"Section added successfully"]);
} else {
    echo json_encode(["status"=>"error","message"=>$stmt->error]);
}

$stmt->close();
$conn->close();
?>
