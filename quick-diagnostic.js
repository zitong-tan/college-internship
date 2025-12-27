// Quick Diagnostic Script
// Copy and paste this entire script into your browser console
// when on the positions list page

(function() {
  console.log('\n🔍 ===== QUICK DIAGNOSTIC START ===== 🔍\n');
  
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };
  
  // Test 1: Check Vue App
  const app = document.getElementById('app');
  if (app && app.innerHTML.length > 100) {
    results.passed.push('✅ Vue app is mounted');
  } else {
    results.failed.push('❌ Vue app not mounted or empty');
  }
  
  // Test 2: Check Layout
  const layout = document.querySelector('.app-layout');
  if (layout) {
    results.passed.push('✅ Layout component rendered');
  } else {
    results.failed.push('❌ Layout component not found');
  }
  
  // Test 3: Check Main Content
  const main = document.querySelector('.main-content');
  if (main) {
    results.passed.push('✅ Main content area exists');
  } else {
    results.failed.push('❌ Main content area not found');
  }
  
  // Test 4: Check Page Container
  const container = document.querySelector('.page-container');
  if (container) {
    results.passed.push('✅ Page container exists');
  } else {
    results.failed.push('❌ Page container not found');
  }
  
  // Test 5: Check Position List
  const list = document.querySelector('.position-list');
  if (list) {
    results.passed.push('✅ Position list container exists');
    
    // Check visibility
    const styles = window.getComputedStyle(list);
    if (styles.display === 'none') {
      results.failed.push('❌ Position list has display: none');
    } else if (styles.visibility === 'hidden') {
      results.failed.push('❌ Position list has visibility: hidden');
    } else if (parseFloat(styles.opacity) === 0) {
      results.failed.push('❌ Position list has opacity: 0');
    } else {
      results.passed.push('✅ Position list is visible');
    }
  } else {
    results.failed.push('❌ Position list container not found');
  }
  
  // Test 6: Check Position Cards
  const cards = document.querySelectorAll('.position-card');
  if (cards.length > 0) {
    results.passed.push(`✅ Found ${cards.length} position cards`);
    
    // Check first card visibility
    const firstCard = cards[0];
    const cardStyles = window.getComputedStyle(firstCard);
    if (cardStyles.display !== 'none' && 
        cardStyles.visibility !== 'hidden' && 
        parseFloat(cardStyles.opacity) > 0) {
      results.passed.push('✅ Position cards are visible');
    } else {
      results.failed.push('❌ Position cards exist but are hidden');
    }
  } else {
    results.warnings.push('⚠️  No position cards found in DOM');
  }
  
  // Test 7: Check Loading State
  const loading = document.querySelector('.el-loading-mask');
  if (loading) {
    results.warnings.push('⚠️  Loading spinner is active');
  } else {
    results.passed.push('✅ Not in loading state');
  }
  
  // Test 8: Check Empty State
  const empty = document.querySelector('.el-empty');
  if (empty) {
    results.warnings.push('⚠️  Empty state message is showing');
  } else {
    results.passed.push('✅ No empty state message');
  }
  
  // Test 9: Check Authentication
  const token = localStorage.getItem('token');
  if (token) {
    results.passed.push('✅ User is authenticated');
  } else {
    results.failed.push('❌ No authentication token found');
  }
  
  // Test 10: Check Element Plus
  const elCards = document.querySelectorAll('.el-card');
  if (elCards.length > 0) {
    results.passed.push(`✅ Element Plus working (${elCards.length} el-cards)`);
  } else {
    results.warnings.push('⚠️  No Element Plus cards found');
  }
  
  // Print Results
  console.log('📊 DIAGNOSTIC RESULTS:\n');
  
  if (results.passed.length > 0) {
    console.log('%c✅ PASSED TESTS:', 'color: green; font-weight: bold');
    results.passed.forEach(msg => console.log(msg));
    console.log('');
  }
  
  if (results.warnings.length > 0) {
    console.log('%c⚠️  WARNINGS:', 'color: orange; font-weight: bold');
    results.warnings.forEach(msg => console.log(msg));
    console.log('');
  }
  
  if (results.failed.length > 0) {
    console.log('%c❌ FAILED TESTS:', 'color: red; font-weight: bold');
    results.failed.forEach(msg => console.log(msg));
    console.log('');
  }
  
  // Diagnosis
  console.log('🔬 DIAGNOSIS:\n');
  
  if (results.failed.length === 0 && cards.length > 0) {
    console.log('%c✅ Everything looks good! Content should be visible.', 'color: green; font-weight: bold');
    console.log('If you still can\'t see content, try:');
    console.log('1. Scroll down the page');
    console.log('2. Zoom out (Ctrl + -)');
    console.log('3. Check if content is behind another element');
  } else if (cards.length === 0 && !loading && !empty) {
    console.log('%c⚠️  Cards not in DOM but no loading/empty state', 'color: orange; font-weight: bold');
    console.log('Possible causes:');
    console.log('1. Data not loaded yet - wait a moment');
    console.log('2. Vue template not rendering - check console for errors');
    console.log('3. v-for not working - check component logic');
  } else if (empty) {
    console.log('%c⚠️  Empty state is showing', 'color: orange; font-weight: bold');
    console.log('Possible causes:');
    console.log('1. No data in database - run: mysql -u root -p internship_management < insert_test_data.sql');
    console.log('2. API returning empty array - check Network tab');
    console.log('3. Wrong data path - check response.data.positions');
  } else if (loading) {
    console.log('%c⚠️  Still loading', 'color: orange; font-weight: bold');
    console.log('Possible causes:');
    console.log('1. API call taking too long');
    console.log('2. API call failed - check Network tab');
    console.log('3. Loading state not being cleared - check console for errors');
  } else if (cards.length > 0 && results.failed.some(f => f.includes('hidden'))) {
    console.log('%c❌ Cards exist but are hidden by CSS', 'color: red; font-weight: bold');
    console.log('Check for:');
    console.log('1. display: none');
    console.log('2. visibility: hidden');
    console.log('3. opacity: 0');
    console.log('4. height: 0');
  } else {
    console.log('%c❌ Multiple issues detected', 'color: red; font-weight: bold');
    console.log('Review failed tests above and:');
    console.log('1. Check browser console for JavaScript errors');
    console.log('2. Check Network tab for failed API calls');
    console.log('3. Try hard refresh (Ctrl+Shift+R)');
    console.log('4. Try clearing cache and reloading');
  }
  
  console.log('\n🔍 ===== QUICK DIAGNOSTIC END ===== 🔍\n');
  
  // Return summary object
  return {
    passed: results.passed.length,
    warnings: results.warnings.length,
    failed: results.failed.length,
    totalCards: cards.length,
    isLoading: !!loading,
    isEmpty: !!empty,
    hasToken: !!token
  };
})();
