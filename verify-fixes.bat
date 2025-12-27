@echo off
echo.
echo 🔍 Verifying Position Display Fixes
echo ====================================
echo.

REM Check if backend is running
echo 1. Checking if backend is running...
curl -s http://localhost:3000/api/positions?page=1^&limit=1 > nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Backend is running
) else (
    echo    ❌ Backend is not running
    echo    Please start backend: cd backend ^&^& npm start
    exit /b 1
)

REM Test positions API
echo.
echo 2. Testing positions API...
curl -s http://localhost:3000/api/positions?page=1^&limit=1 > temp_response.json
findstr /C:"\"success\":true" temp_response.json > nul
if %errorlevel% equ 0 (
    echo    ✅ API returns success
    
    findstr /C:"\"positions\":[" temp_response.json > nul
    if %errorlevel% equ 0 (
        echo    ✅ Positions array found
        
        findstr /C:"\"enterprise\":{" temp_response.json > nul
        if %errorlevel% equ 0 (
            echo    ✅ Enterprise association included
            
            findstr /C:"\"company_name\"" temp_response.json > nul
            if %errorlevel% equ 0 (
                echo    ✅ company_name field present
            ) else (
                echo    ⚠️  company_name field missing
            )
        ) else (
            echo    ⚠️  Enterprise association missing
        )
    ) else (
        echo    ⚠️  Positions array not found or empty
    )
) else (
    echo    ❌ API returned error
    type temp_response.json
)
del temp_response.json > nul 2>&1

REM Check fixed files
echo.
echo 3. Verifying fixed files...
set FILES=src\views\student\PositionList.vue src\views\student\PositionDetail.vue src\components\student\ApplicationForm.vue src\views\student\InternshipList.vue src\views\student\InternshipDetail.vue src\views\student\ApplicationList.vue

for %%f in (%FILES%) do (
    if exist "%%f" (
        findstr /C:"enterprise?.company_name" /C:"position?.enterprise?.company_name" /C:"position?.title" "%%f" > nul
        if %errorlevel% equ 0 (
            echo    ✅ %%f - Fixed
        ) else (
            echo    ⚠️  %%f - May need fixing
        )
    ) else (
        echo    ❌ %%f - Not found
    )
)

echo.
echo ====================================
echo ✅ Verification complete!
echo.
echo Next steps:
echo 1. Open browser and navigate to http://localhost:8080
echo 2. Login as a student
echo 3. Check positions list page
echo 4. Open browser console (F12) to see debug logs
echo.
pause
