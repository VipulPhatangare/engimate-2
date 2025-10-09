const express = require('express');
const router = express.Router();
const {db, supabase} = require('../database/db');

router.get('/logout',(req,res)=>{
  req.session.destroy(err => {
    if (err) return res.json({msg : 'error',islogout : false});
    res.json({msg : 'logout succefully.',islogout : true})
  });
});

router.get('/percentilePredictor',(req,res)=>{
  res.render('percentilepredictor'); 
});

router.get('/collegePredictorPCM',(req,res)=>{
  res.render('collegePredictorPCM'); 
});

router.get('/branchCutoffs',(req,res)=>{
  res.render('branchwiseCutoffPCM'); 
});

router.get('/topCollegePCM',(req,res)=>{
  res.render('topCollegePCM'); 
});


function college_filter_by_city(colleges, cityArray) {
  const normalizedCityArray = cityArray.map(c => c.trim().toUpperCase());

  return colleges.filter(college => 
    normalizedCityArray.includes(college.city.trim().toUpperCase())
  );
}

router.post('/topCollegeList', async (req, res) => {
  try {
    const formData = req.body;
    // console.log(formData);
    
    let query = supabase
      .from('college_2025_26')
      .select('college_code, college_name, city, college_rank ,university');

    // Apply university filter if not 'All'
    if (formData.university !== 'All') {
      query = query.eq('university', formData.university);
    }

    // Execute the query
    const { data, error } = await query;
    // console.log(data);
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    // Apply city filter if not 'All'
    let colleges = data;
    if (formData.cities[0] !== 'All') {
      colleges = college_filter_by_city(data, formData.cities);
    }

    colleges.sort((a, b) => a.college_rank - b.college_rank);
    // console.log(colleges);
    return res.json(colleges);
    
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});


router.get('/collegeNames', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('eng_2025_college_info')
      .select('college_code, college_name');
    // console.log(data)
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    return res.json(data);
    
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;