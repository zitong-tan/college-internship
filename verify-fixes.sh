#!/bin/bash

echo "🔍 Verifying Position Display Fixes"
echo "===================================="
echo ""

# Check if backend is running
echo "1. Checking if backend is running..."
if curl -s http://localhost:3000/api/positions?page=1&limit=1 > /dev/null; then
    echo "   ✅ Backend is running"
else
    echo "   ❌ Backend is not running"
    echo "   Please start backend: cd backend && npm start"
    exit 1
fi

# Test positions API
echo ""
echo "2. Testing positions API..."
RESPONSE=$(curl -s http://localhost:3000/api/positions?page=1&limit=1)
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "   ✅ API returns success"
    
    # Check if positions array exists
    if echo "$RESPONSE" | grep -q '"positions":\['; then
        echo "   ✅ Positions array found"
        
        # Check if enterprise association exists
        if echo "$RESPONSE" | grep -q '"enterprise":{'; then
            echo "   ✅ Enterprise association included"
            
            # Check if company_name exists
            if echo "$RESPONSE" | grep -q '"company_name"'; then
                echo "   ✅ company_name field present"
            else
                echo "   ⚠️  company_name field missing"
            fi
        else
            echo "   ⚠️  Enterprise association missing"
        fi
    else
        echo "   ⚠️  Positions array not found or empty"
    fi
else
    echo "   ❌ API returned error"
    echo "$RESPONSE"
fi

# Check if test data exists
echo ""
echo "3. Checking database data..."
TOTAL=$(echo "$RESPONSE" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
if [ -n "$TOTAL" ] && [ "$TOTAL" -gt 0 ]; then
    echo "   ✅ Found $TOTAL positions in database"
else
    echo "   ⚠️  No positions found in database"
    echo "   Run: mysql -u root -p internship_management < insert_test_data.sql"
fi

# Check fixed files
echo ""
echo "4. Verifying fixed files..."
FILES=(
    "src/views/student/PositionList.vue"
    "src/views/student/PositionDetail.vue"
    "src/components/student/ApplicationForm.vue"
    "src/views/student/InternshipList.vue"
    "src/views/student/InternshipDetail.vue"
    "src/views/student/ApplicationList.vue"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        if grep -q "enterprise?.company_name\|position?.enterprise?.company_name\|position?.title" "$file"; then
            echo "   ✅ $file - Fixed"
        else
            echo "   ⚠️  $file - May need fixing"
        fi
    else
        echo "   ❌ $file - Not found"
    fi
done

echo ""
echo "===================================="
echo "✅ Verification complete!"
echo ""
echo "Next steps:"
echo "1. Open browser and navigate to http://localhost:8080"
echo "2. Login as a student"
echo "3. Check positions list page"
echo "4. Open browser console (F12) to see debug logs"
echo ""
