let enrollmentList = [];
let currentSort = { column: "enrollment_id", direction: "desc" };
let currentPage = 1;
const rowsPerPage = 10;
let totalPages = 1;
let allSections = []; // Global storage for all fetched sections
let allStudents = {}; // Global storage for student details (key: student_id)
let currentAcademicYear = 0; // Global storage for the current year

document.addEventListener("DOMContentLoaded", () => {
    const enrollmentTableBody = document.querySelector('#enrollmentTable tbody');
    const searchInput = document.getElementById('searchInput');
    const paginationContainer = document.querySelector('.pagination-controls');
    const enrollmentTypeSelect = document.getElementById('enrollment_type');

    // Buttons
    const saveBtn = document.getElementById('saveBtn');
    const updateBtn = document.getElementById('updateBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const studentSelect = document.getElementById('student_id');
    const sectionSelect = document.getElementById('section_id');

    // Modals and Controls
    const enrollmentModal = document.getElementById('enrollmentModal');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    
    // 🆕 New Course Details Modal elements
    const courseDetailsModal = document.getElementById('courseDetailsModal');
    const closeCourseDetailsModalBtn = document.getElementById('closeCourseDetailsModalBtn');
    const closeCourseDetailsBtn = document.getElementById('closeCourseDetailsBtn');
    const courseDetailsTitle = document.getElementById('courseDetailsTitle');
    const courseDetailsContent = document.getElementById('courseDetailsContent');


    // =================== Modal Control (Enrollment Form) ===================
    openModalBtn.addEventListener('click', () => {
        clearForm();
        enrollmentModal.style.display = 'flex';
        updateSectionDropdown();
    });
    closeModalBtn.addEventListener('click', closeEnrollmentModal);
    window.addEventListener('click', e => { if (e.target === enrollmentModal) closeEnrollmentModal(); });

    function closeEnrollmentModal() {
        enrollmentModal.style.display = 'none';
        clearForm();
    }
    
    // =================== Modal Control (Course Details Popup) ===================
    closeCourseDetailsModalBtn.addEventListener('click', closeCourseDetailsModal);
    closeCourseDetailsBtn.addEventListener('click', closeCourseDetailsModal);
    window.addEventListener('click', e => { if (e.target === courseDetailsModal) closeCourseDetailsModal(); });

    function closeCourseDetailsModal() {
        courseDetailsModal.style.display = 'none';
        courseDetailsContent.innerHTML = '<p>Loading course data...</p>'; // Reset content
        courseDetailsTitle.textContent = 'Currently Enrolled Courses';
    }


    // =================== Helper: Fetch JSON (IMPROVED Error Debugging) ===================
    async function fetchJSON(url, options = {}) {
        try {
            const res = await fetch(url, options);
            if (!res.ok) {
                // Read the text of the response if status is not ok, to help debug
                const text = await res.text();
                // Throw an error with a larger response text snippet (500 chars)
                throw new Error(`HTTP error! Status: ${res.status}. Response start: ${text.substring(0, 500)}...`);
            }
            return await res.json();
        } catch (err) {
            console.error(`❌ Fetch error for ${url}:`, err);
            
            // Explicitly flag SyntaxError for easier debugging of non-JSON PHP output
            if (err instanceof SyntaxError) {
                 console.error("⚠️ Failed to parse JSON. Server response was likely HTML/PHP error messages.");
            }

            if (options.isList) {
                return { data: [], total_records: 0, status: 'error', message: err.message }; 
            }
            // Return a standardized error object on failure for the caller to check `response.status === 'error'`
            return { status: 'error', message: err.message }; 
        }
    }

    async function fetchCurrentAcademicYear() {
        const url = 'php/fetch_current_year.php';
        const response = await fetchJSON(url);
        if (response.status === 'success' && response.year) {
            currentAcademicYear = response.year;
            console.log("Current Academic Year fetched:", currentAcademicYear);
        } else {
            // Use current year as fallback if fetch fails or returns error status
            currentAcademicYear = new Date().getFullYear();
            console.error(response.message || "Failed to fetch current year, using fallback:", currentAcademicYear);
        }
    }

    // =================== Load Students (Modified to store details) ===================
    async function loadStudents() {
        const data = await fetchJSON('php/fetch_students.php');
        studentSelect.innerHTML = '<option value="">Select Student</option>';
        
        // Handle potential error response which might be an object { status: 'error', ... }
        const studentsArray = Array.isArray(data) ? data : (data.data || []);

        studentsArray.forEach(s => {
            studentSelect.innerHTML += `<option value="${s.student_id}">${s.student_name} (${s.student_id})</option>`;
            allStudents[s.student_id] = { 
                year_level: s.year_level, // e.g., '3-1'
                program_code: s.program_code, // e.g., 'DIT-TG'
                student_name: s.student_name // Store name for lookup
            };
        });
    }

    // =================== Load Sections (Modified to store all data) ===================
    async function loadSections() {
        const data = await fetchJSON('php/fetch_sections.php');
        
        // Handle potential error response which might be an object { status: 'error', ... }
        if (data && data.status === "error") {
            console.error("Error fetching sections:", data.message);
            allSections = [];
        } else {
            allSections = Array.isArray(data) ? data : (data.data || []);
        }
        updateSectionDropdown();
    }
    
    // =================== Conditional Dropdown Filter (Dynamic Logic) ===================
    function updateSectionDropdown() {
        const enrollmentType = enrollmentTypeSelect.value;
        const studentId = studentSelect.value;
        const sectionSelect = document.getElementById('section_id');

        sectionSelect.innerHTML = '<option value="">Select Section</option>';
        sectionSelect.disabled = true;

        if (!studentId) {
            sectionSelect.innerHTML += '<option value="" disabled>Select a student to filter sections</option>';
            return;
        }

        const studentDetails = allStudents[studentId];
        if (!studentDetails) {
            sectionSelect.innerHTML += '<option value="" disabled>Student details not found.</option>';
            return;
        }
        
        let filteredSections = [];
        let dropdownPlaceholder = 'Select Section';

        if (enrollmentType === 'Regular') {
            const [yearNum, semesterNum] = studentDetails.year_level.split('-'); 
            const programBase = studentDetails.program_code ? studentDetails.program_code.replace(/-TG$/, '') : 'DIT'; 
            
            const targetSectionCode = `${programBase}-${yearNum}-${semesterNum}-TG`; 

            // 🚨 FIX: Removed the academic year filter here to allow enrollment into blocks 
            // defined in any year that match the required section code (level/program).
            filteredSections = allSections.filter(sec => 
                sec.section_code === targetSectionCode
            );
            
            if (filteredSections.length > 0) {
                // Find a unique list of section codes and years to display.
                // Since blocks might be duplicated across years, we ensure only one unique option is selectable per section code.
                const uniqueBlocks = {};
                filteredSections.forEach(sec => {
                    const key = `${sec.section_code}-${sec.year}`;
                    if (!uniqueBlocks[key]) {
                        uniqueBlocks[key] = sec;
                    }
                });

                // Display only the unique block options
                sectionSelect.innerHTML = `<option value="">Select Block Section</option>`;
                Object.values(uniqueBlocks).forEach(sec => {
                    const displayLabel = `[ENROLLED BLOCK] ${sec.section_code} - ${sec.year}`;
                    // Use the section_id of one of the courses in the block to identify the block
                    sectionSelect.innerHTML += `<option value="${sec.section_id}">${displayLabel}</option>`;
                });

                sectionSelect.disabled = false;
            } else {
                dropdownPlaceholder = `No Block Found (${targetSectionCode})`;
                sectionSelect.innerHTML = `<option value="" disabled>${dropdownPlaceholder}</option>`;
            }

        } else if (enrollmentType === 'Irregular') {
            filteredSections = allSections; 
            dropdownPlaceholder = 'Select Course Section to Enroll';
            sectionSelect.disabled = false;
            
            sectionSelect.innerHTML = `<option value="">${dropdownPlaceholder}</option>`;
            filteredSections.forEach(sec => {
                const displayText = sec.display_text; 
                sectionSelect.innerHTML += `<option value="${sec.section_id}">${displayText}</option>`;
            });
        }
        
        // Final check to disable if only the placeholder is left
        if (sectionSelect.options.length === 1 && sectionSelect.value === "") {
            sectionSelect.disabled = true;
        }
        
        if (studentId && enrollmentType === 'Irregular' && filteredSections.length > 0) {
            sectionSelect.disabled = false;
        }
    }
    
    // 🆕 New: Populate and Show Course Details Modal
    async function populateCourseDetailsModal(studentId, studentName) {
        courseDetailsTitle.textContent = `Enrolled Courses for ${studentName}`;
        courseDetailsContent.innerHTML = '<p>Loading course data...</p>';

        const url = `php/fetch_student_enrollments.php?student_id=${studentId}`;
        const response = await fetchJSON(url); 
        
        if (response.status === 'error') {
            courseDetailsContent.innerHTML = `<p style="color: #dc3545;">Error loading enrollments: ${response.message || 'Check network console.'}</p>`;
            return;
        }
        
        const enrollments = Array.isArray(response) ? response : (response.data || []);

        if (enrollments.length === 0) {
            courseDetailsContent.innerHTML = `<p>✅ Student has no current active enrollments (Status: Enrolled/Pending).</p>`;
        } else {
            let html = '<ul style="list-style: none; padding-left: 0;">';
            
            enrollments.forEach(e => {
                const courseCode = e.course_code || 'N/A';
                const sectionCode = e.section_code || 'N/A';
                const status = e.status || 'N/A';
                const type = e.enrollment_type || 'N/A';

                html += `<li style="margin-left: 5px;">
                            <span style="font-weight: 600;">${courseCode}</span> (${sectionCode}) 
                            - Status: <span style="font-style: italic; color: #800000;">${status}</span> 
                            (${type})
                        </li>`;
            });
            
            html += '</ul>';
            courseDetailsContent.innerHTML = html;
        }
        courseDetailsModal.style.display = 'flex';
    }
    
    // Make it globally accessible for the new button in the table
    window.openCourseDetailsModal = (studentId) => {
        // Look up student name from the locally stored map
        const student = allStudents[studentId];
        const studentName = student ? student.student_name : `Student ID ${studentId}`;
        populateCourseDetailsModal(studentId, studentName);
    };


    // Event Listeners for the Dropdown Filter (Enrollment Modal)
    enrollmentTypeSelect.addEventListener('change', updateSectionDropdown);
    studentSelect.addEventListener('change', updateSectionDropdown); // Only filter sections on student change

    // =================== Load Enrollments (Updated for Display & New Button) ===================
    async function loadEnrollments(query = "") {
        const { column, direction } = currentSort;
        const page = currentPage;
        const limit = rowsPerPage;
        const url = `php/get_enrollment.php?search=${encodeURIComponent(query)}&sort_by=${column}&order=${direction}&page=${page}&limit=${limit}`;

        const response = await fetchJSON(url, { isList: true });
        const data = response.data || [];
        const totalRecords = response.total_records || 0;

        enrollmentList = data;
        enrollmentTableBody.innerHTML = "";
        totalPages = Math.ceil(totalRecords / rowsPerPage);

        if (!Array.isArray(data) || data.length === 0) {
            enrollmentTableBody.innerHTML = `<tr><td colspan="8" class="no-data">No enrollments found</td></tr>`;
        } else {
            data.forEach(e => {
                // IMPORTANT: Ensure student_id is an integer. 
                const studentId = parseInt(e.student_id); 
                
                // Safety check: only render the button if the student ID is a positive number
                const showCoursesBtn = (studentId && studentId > 0)
                    ? `<button class="action-btn show-courses-btn" onclick="openCourseDetailsModal(${studentId})">Show Courses</button>`
                    : `<button class="action-btn" disabled title="Student ID not found">No Courses</button>`;

                enrollmentTableBody.innerHTML += `
                    <tr>
                        <td>${e.enrollment_id}</td>
                        <td>${e.student_name}</td>
                        <td>${e.section_code}</td>
                        <td>${e.enrollment_type}</td>
                        <td>${e.date_enrolled}</td>
                        <td>${e.status}</td>
                        <td>${e.letter_grade || ''}</td>
                        <td>
                            ${showCoursesBtn}
                            <button class="action-btn edit-btn" onclick="editEnrollment(${e.enrollment_id})">Edit</button>
                            <button class="action-btn delete-btn" onclick="deleteEnrollment(${e.enrollment_id})">Delete</button>
                        </td>
                    </tr>
                `;
            });
        }

        updateSortIndicators();
        renderPaginationControls();
    }

    // =================== Pagination Controls (Unchanged) ===================
    function renderPaginationControls() {
        paginationContainer.innerHTML = '';
        if (totalPages <= 1) return;

        const prevBtn = document.createElement('button');
        prevBtn.textContent = '« Previous';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                loadEnrollments(searchInput.value.trim());
            }
        };
        paginationContainer.appendChild(prevBtn);

        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        pageInfo.className = 'page-info';
        paginationContainer.appendChild(pageInfo);

        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next »';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadEnrollments(searchInput.value.trim());
            }
        };
        paginationContainer.appendChild(nextBtn);
    }

    // =================== Sorting (Unchanged) ===================
    document.querySelectorAll('#enrollmentTable thead th[data-column]').forEach(th => {
        th.addEventListener('click', () => toggleSort(th.getAttribute('data-column')));
    });

    function toggleSort(column) {
        if (currentSort.column === column) {
            currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
        } else {
            currentSort.column = column;
            currentSort.direction = "asc";
        }
        currentPage = 1;
        loadEnrollments(searchInput.value.trim());
    }

    function updateSortIndicators() {
        document.querySelectorAll('#enrollmentTable thead th[data-column]').forEach(th => {
            const col = th.getAttribute('data-column');
            const label = th.getAttribute('data-label') || th.textContent.replace(/ ▲| ▼| ↕/g, '').trim();
            th.setAttribute('data-label', label);

            if (col === currentSort.column) {
                th.innerHTML = `${label} ${currentSort.direction === "asc" ? "▲" : "▼"}`;
                th.classList.add('active-sort');
            } else {
                th.innerHTML = `${label} ↕`;
                th.classList.remove('active-sort');
            }
        });
    }

    // =================== Search (Unchanged) ===================
    searchInput.addEventListener('input', e => {
        currentPage = 1;
        loadEnrollments(e.target.value.trim());
    });

    // =================== Save (Fixed JSON reading) ===================
    saveBtn.addEventListener('click', async () => {
        const payload = getFormData();
        if (!payload) return;

        const res = await fetch('php/add_enrollment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const resp = await res.json(); 

        if (resp.status === "success") {
            console.log('✅ Enrollment added successfully! Message: ' + resp.message);
            currentPage = 1;
            loadEnrollments();
            closeEnrollmentModal();
        } else {
            console.error('⚠️ Error adding enrollment: ' + resp.message); 
            alert('⚠️ Error adding enrollment: ' + resp.message); 
        }
    });

    // =================== Update (Fixed JSON reading) ===================
    updateBtn.addEventListener('click', async () => {
        const payload = getFormData();
        if (!payload) return;

        payload.enrollment_id = document.getElementById('enrollment_id').value;

        const res = await fetch('php/update_enrollment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const resp = await res.json(); 
        
        if (resp.status === "success") {
            console.log('✅ Enrollment updated successfully!');
            loadEnrollments(searchInput.value.trim());
            closeEnrollmentModal();
        } else {
            console.error('⚠️ Error updating enrollment: ' + resp.message);
            alert('⚠️ Error updating enrollment: ' + resp.message); 
        }
    });

    cancelBtn.addEventListener('click', closeEnrollmentModal);

    // =================== Form Helpers (Updated for enrollment_type) ===================
    function clearForm() {
        document.getElementById('enrollment_id').value = '';
        studentSelect.value = '';
        enrollmentTypeSelect.value = 'Regular';
        sectionSelect.value = '';
        document.getElementById('date_enrolled').value = '';
        document.getElementById('status').value = '';
        document.getElementById('letter_grade').value = '';
        saveBtn.style.display = 'inline-block';
        updateBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
        updateSectionDropdown(); // Re-filter dropdown on clear
    }

    function getFormData() {
        const student_id = studentSelect.value;
        const enrollment_type = enrollmentTypeSelect.value;
        const section_id = sectionSelect.value;
        const date_enrolled = document.getElementById('date_enrolled').value;
        const status = document.getElementById('status').value;
        const letter_grade = document.getElementById('letter_grade').value;

        if (!student_id || !section_id || !date_enrolled || !status) {
            alert("⚠️ Please fill in all required fields (Student, Section, Date, Status).");
            return null;
        }

        return { student_id: parseInt(student_id), enrollment_type, section_id: parseInt(section_id), date_enrolled, status, letter_grade };
    }

    // =================== Edit (Modified to remove loadStudentEnrollments) ===================
    window.editEnrollment = async (id) => {
        const data = await fetchJSON(`php/get_enrollment.php?id=${id}`);
        if (!data || data.status === "error") {
             console.error("Failed to fetch enrollment data for ID:", id);
             return;
        }

        document.getElementById('enrollment_id').value = data.enrollment_id;
        studentSelect.value = data.student_id;
        enrollmentTypeSelect.value = data.enrollment_type;
        
        // Removed loadStudentEnrollments(data.student_id); as it's now a separate action

        updateSectionDropdown(); // Filter options based on fetched student/type

        // Delay setting sectionSelect value to ensure options are loaded
        setTimeout(() => {
             sectionSelect.value = data.section_id;
        }, 50);

        document.getElementById('date_enrolled').value = data.date_enrolled;
        document.getElementById('status').value = data.status;
        document.getElementById('letter_grade').value = data.letter_grade;

        saveBtn.style.display = 'none';
        updateBtn.style.display = 'inline-block';
        cancelBtn.style.display = 'inline-block';
        enrollmentModal.style.display = 'flex';
    };

    // =================== Delete (Unchanged) ===================
    window.deleteEnrollment = async (id) => {
        if (!confirm("❌ Are you sure you want to delete this enrollment?")) return;
        const response = await fetch(`php/delete_enrollment.php?id=${id}`);
        const resp = await response.json(); 
        
        if (resp.status === "success") {
            console.log('🗑 Enrollment deleted successfully!');
        } else {
            console.error('⚠️ Error deleting enrollment: ' + resp.message);
            alert('⚠️ Error deleting enrollment: ' + resp.message);
        }
        
        if (enrollmentList.length === 1 && currentPage > 1) {
            currentPage--;
        }
        
        loadEnrollments(searchInput.value.trim());
    };

    // =================== Export (Unchanged) ===================
    document.getElementById('exportExcelBtn').addEventListener('click', () => {
        window.location.href = 'php/export_excel.php';
    });
    document.getElementById('exportPdfBtn').addEventListener('click', () => {
        window.location.href = 'php/export_pdf.php';
    });

    // =================== Initial Load ===================
    fetchCurrentAcademicYear();
    loadStudents();
    loadSections(); // This stores data and calls updateSectionDropdown
    loadEnrollments();
});