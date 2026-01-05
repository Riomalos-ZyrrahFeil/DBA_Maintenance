<?php
$current_page = basename($_SERVER['PHP_PATH_INFO'] ?? $_SERVER['PHP_SELF']);
?>
<div class="sidebar">
    <div class="sidebar-header">
        <img src="https://www.pup.edu.ph/about/images/logo.png" alt="PUP Logo" class="sidebar-logo">
        <h3>PUP Maintenance</h3>
    </div>
    
    <nav class="sidebar-nav">
        <ul>
            <li class="<?php echo ($current_page == 'dashboard.php') ? 'active' : ''; ?>">
                <a href="/dashboard/MaintenanceModule/dashboard.php">Dashboard</a>
            </li>
            <li class="<?php echo ($current_page == 'index.php' && strpos($_SERVER['PHP_SELF'], 'department_maintenance') !== false) ? 'active' : ''; ?>">
                <a href="/dashboard/MaintenanceModule/department_maintenance/index.php">Department Maintenance</a>
            </li>
            <li class="<?php echo ($current_page == 'index.php' && strpos($_SERVER['PHP_SELF'], 'term_maintenance') !== false) ? 'active' : ''; ?>">
                <a href="/dashboard/MaintenanceModule/term_maintenance/index.php">Term Maintenance</a>
            </li>
            <li class="<?php echo ($current_page == 'index.php' && strpos($_SERVER['PHP_SELF'], 'room_maintenance') !== false) ? 'active' : ''; ?>">
                <a href="/dashboard/MaintenanceModule/room_maintenance/index.php">Room Maintenance</a>
            </li>
            <li class="<?php echo ($current_page == 'index.php' && strpos($_SERVER['PHP_SELF'], 'program_maintenance') !== false) ? 'active' : ''; ?>">
                <a href="/dashboard/MaintenanceModule/program_maintenance/index.php">Program Maintenance</a>
            </li>
            <li class="<?php echo ($current_page == 'index.php' && strpos($_SERVER['PHP_SELF'], 'instructor_maintenance') !== false) ? 'active' : ''; ?>">
                <a href="/dashboard/MaintenanceModule/instructor_maintenance/index.php">Instructor Maintenance</a>
            </li>
            <li class="<?php echo ($current_page == 'index.php' && strpos($_SERVER['PHP_SELF'], 'course_maintenance') !== false) ? 'active' : ''; ?>">
                <a href="/dashboard/MaintenanceModule/course_maintenance/index.php">Course Maintenance</a>
            </li>
            <li class="<?php echo ($current_page == 'index.php' && strpos($_SERVER['PHP_SELF'], 'course_prerequisite_maintenance') !== false) ? 'active' : ''; ?>">
                <a href="/dashboard/MaintenanceModule/course_prerequisite_maintenance/index.php">Course Prerequisite Maintenance</a>
            </li>
            <li class="<?php echo ($current_page == 'index.php' && strpos($_SERVER['PHP_SELF'], 'student_maintenance') !== false) ? 'active' : ''; ?>">
                <a href="/dashboard/MaintenanceModule/student_maintenance/index.php">Student Maintenance</a>
            </li>
           <li class="<?php echo ($current_page == 'index.php' && strpos($_SERVER['PHP_SELF'], 'section_maintenance') !== false) ? 'active' : ''; ?>">
                <a href="/dashboard/MaintenanceModule/section_maintenance/index.php">Section Maintenance</a>
            </li>
            <li class="<?php echo ($current_page == 'index.php' && strpos($_SERVER['PHP_SELF'], 'enrollment_maintenance') !== false) ? 'active' : ''; ?>">
                <a href="/dashboard/MaintenanceModule/enrollment_maintenance/index.php">Enrollment Maintenance</a>
            </li>
        </ul>
    </nav>

    <div class="sidebar-footer">
        <a href="php/logout.php" class="logout-link">Logout</a>
    </div>
</div>