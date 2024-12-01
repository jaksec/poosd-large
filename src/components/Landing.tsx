import KnightLogo from '/logo.png';
import './background.scss';
import './Landing.css';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import pfp from '/profile_icon.png';
import arrow from '/arrow-dm.png';
import plus from '/add.png';
import axios from 'axios';
import edit from '/edit.png';
import del from '/trash.png';
import ProgressBar from './ProgressBar';

// Function to save toggle state to localStorage
const saveToggleState = (isChartMode: boolean) => {
  localStorage.setItem('isChartMode', JSON.stringify(isChartMode));
};

// Function to load toggle state from localStorage
const loadToggleState = (): boolean => {
  const savedState = localStorage.getItem('isChartMode');
  return savedState !== null ? JSON.parse(savedState) : true; // Default to true (Entries)
};

const Landing: React.FC = () => {
  // State variables
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [isGoalsPopupVisible, setisGoalsPopupVisible] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [isChartMode, setIsChartMode] = useState<boolean>(loadToggleState()); // Initialize with saved state
  
  const [GoalCals, setGoalCals] = useState<number | "">("");
  const [GoalProt, setGoalProt] = useState<number | "">("");
  const [GoalCarb, setGoalCarb] = useState<number | "">("");
  const [GoalFats, setGoalFats] = useState<number | "">(""); // Corrected setter function
  const [GoalProtPercent, setGoalProtPercent] = useState<number | "">("");
  const [GoalCarbPercent, setGoalCarbPercent] = useState<number | "">("");
  const [GoalFatPercent, setGoalFatPercent] = useState<number | "">("");


  const [goalExists, setGoalExists] = useState<boolean>(false);
  const [error, setError] = useState<string>('');


  const [goalCalories, setGoalCalories] = useState<number>(0);
  const [goalProtein, setGoalProtein] = useState<number>(0);
  const [goalCarbs, setGoalCarbs] = useState<number>(0);
  const [goalFats, setGoalFatsNumeric] = useState<number>(0); // Renamed to avoid conflict


  const [currentCalories, setCurrentCalories] = useState<number>(0);
  const [currentProtein, setCurrentProtein] = useState<number>(0);
  const [currentCarbs, setCurrentCarbs] = useState<number>(0);
  const [currentFats, setCurrentFats] = useState<number>(0);

  const [name, setName] = useState<string>('');
  const [calories, setCalories] = useState<string>('');
  const [carbs, setCarbs] = useState<string>('');
  const [fats, setFats] = useState<string>('');
  const [proteins, setProteins] = useState<string>('');
  const [weight, setWeight] = useState<string>(''); // Added state for weight

  const [meals, setMeals] = useState<any[]>([]); // State for meals

  const [isEditPopupVisible, setEditPopupVisible] = useState(false);
  const [editMeal, setEditMeal] = useState<any>(null); // State to hold the meal being edited


  // On component mount, ensure the correct mode is applied
  useEffect(() => {
    document.body.classList.toggle('chart-mode', isChartMode);
    document.body.classList.toggle('nutrition-mode', !isChartMode);
  }, [isChartMode]);

  // Function to get cookies
  const getCookie = (name: string): string => {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : '';
  };

  const AutoFillPercent = () => {
    if(GoalCals == "")
      return;
    else 
    {
      setGoalCarbPercent(Math.round(100*((Number(GoalCarb)*4)/Number(GoalCals)))) 
      setGoalFatPercent(Math.round(100*((Number(GoalFats)*8)/Number(GoalCals))))
      setGoalProtPercent(Math.round(100*((Number(GoalProt)*4)/Number(GoalCals))))
      if(Number(GoalCarbPercent)+Number(GoalFatPercent)+Number(GoalProtPercent) != 100) //line check if we have accidently rounded to 99 and adds the extra percent to carbs
      {
        setGoalCarbPercent(Number(GoalCarbPercent) + 1); 
      }
    }
  }

  const adjustCalorieChange = () => {
    if(GoalCals == "")
    {
      setError("Please fill out Calories");
      setGoalCarb("");
      setGoalCarbPercent("");
      setGoalProt("");
      setGoalProtPercent("");
      setGoalFats("");
      setGoalFatPercent("");
    }
    else if (!(GoalCarbPercent == "") && !(GoalProtPercent == "") && !(GoalFatPercent == ""))
    {
      setError("")
      setGoalCarb(Math.round(GoalCals * (GoalCarbPercent/100)/4));
      setGoalProt(Math.round(GoalCals * (GoalProtPercent/100)/4));
      setGoalFats(Math.round(GoalCals * (GoalFatPercent/100)/8));
      setError(String(GoalCals));
    }
    else
    {
      setError("")
      setGoalCarbPercent(55);
      setGoalCarb(Math.round(GoalCals * (Number(GoalCarbPercent)/100)/4));
      setGoalProtPercent(25);
      setGoalProt(Math.round(GoalCals * (Number(GoalProtPercent)/100)/4));
      setGoalFatPercent(20);
      setGoalFats(Math.round(10*(GoalCals * (Number(GoalFatPercent)/100)/8)));
    }
  }

  const adjustMacroChange = () => {
    if(GoalCarb == '' || GoalProt == '' || GoalFats == "")
    {
      setError("Please fill out all macros");
      return;
    }
    else 
    {
      setError("");
      setGoalCals(GoalCarb*4 + GoalProt*4 + GoalFats*8);
      setGoalCarbPercent(Math.round(GoalCarb*4 / Number(GoalCals)));
      setGoalProtPercent(Math.round(GoalProt*4 / Number(GoalCals)));
      setGoalFatPercent(Math.round(GoalFats*8 / Number(GoalCals)));
      if(Number(GoalCarbPercent) + Number(GoalProtPercent) + Number(GoalFatPercent) != 100)
        setGoalCarbPercent(Number(GoalCarbPercent) + 1);
    }
      
  }

  const adjustPercentChange = () => {
    if(GoalCals == "")
      setError("Please fill out calories");
    else if (GoalCarbPercent == "" || GoalProtPercent == "" || GoalFatPercent == "")
      setError("Please fill out all percentages");
    else if (GoalCarbPercent + GoalProtPercent + GoalFatPercent != 100)
      setError("Ensure all percentages add up to 100");
    else
    {
      setError("");
      setGoalCarb(Math.round(GoalCals * (GoalCarbPercent/100)));
      setGoalProt(Math.round(GoalCals * (GoalProtPercent/100)));
      setGoalFats(Math.round(GoalCals * (GoalFatPercent/100)));
    }
  }

  const validateInput = (value: string) => /^[0-9]*\.?[0-9]*$/.test(value);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleCalorieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validateInput(e.target.value)) setCalories(e.target.value);
  };

  const handleCarbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validateInput(e.target.value)) setCarbs(e.target.value);
  };

  const handleFatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validateInput(e.target.value)) setFats(e.target.value);
  };

  const handleProteinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validateInput(e.target.value)) setProteins(e.target.value);
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validateInput(e.target.value)) setWeight(e.target.value);
  };

  const handleToggle = () => {
    setIsChartMode((prevMode) => {
      const newMode = !prevMode;
      saveToggleState(newMode); // Save the new state
      return newMode;
    });
  };

  const handleGoalCalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoalCals(Number(e.target.value));
    adjustCalorieChange();
  };

  const handleGoalCarbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoalCarb(Number(e.target.value));
    adjustMacroChange();
  };

  const handleGoalProteinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoalProt(Number(e.target.value));
    adjustMacroChange();
  };

  const handleGoalFatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoalFats(Number(e.target.value)); // Corrected setter function
    adjustMacroChange();
  };

  const handleGoalFatPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoalFatPercent(parseInt(e.target.value));
    adjustPercentChange();
  }

  const handleGoalProtPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoalProtPercent(parseInt(e.target.value));
    adjustPercentChange();
  }

  const handleGoalCarbPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoalCarbPercent(parseInt(e.target.value));
    adjustPercentChange();
  }


  const closePopup = () => {
    setPopupVisible(false);
    setName('');
    setCalories('');
    setFats('');
    setCarbs('');
    setProteins('');
    setWeight('');
    setError('');
  };

  const closeGoalsPopup = () => {
    fetchGoal();
    setisGoalsPopupVisible(false);
    setError('');
  };

  const showPopup = () => {
    setPopupVisible(true);
  };

  const showGoalsPopup = () => {
    setisGoalsPopupVisible(true);
    AutoFillPercent();
  };

  const handleSaveGoal = async () => {
    if (goalExists) {
      await handleUpdateGoal();
    } else {
      await handleAddGoal();
    }

    closeGoalsPopup();
  };

  const handleAddGoal = async () => {
    const userId = getCookie('id');

    if (!userId) {
      setError('User ID is missing. Please log in again.');
      return;
    }

    // Validate inputs
    const isValidNumber = (value: string) => /^[0-9]+(\.[0-9]+)?$/.test(value);

    if (GoalCals == '') 
    {
      setError('Please enter valid numbers for all fields.');
      return;
    }

    try {
      const newGoal = {
        userId,
        calories: GoalCals,
        carbs: GoalCarb,
        fats: GoalFats,
        proteins: GoalProt,
      };

      const response = await axios.post('http://146.190.71.194:5000/api/goal/addGoal', newGoal);

      if (response.data.success) {
        setGoalExists(true);

        // Update numeric goal values
        setGoalCalories(Number(newGoal.calories));
        setGoalProtein(Number(newGoal.proteins));
        setGoalCarbs(Number(newGoal.carbs));
        setGoalFatsNumeric(Number(newGoal.fats)); // Updated setter

        closeGoalsPopup();
        console.log('Goal added successfully!');
      }
    } catch (error) {
      console.error('Error adding goal:', error);
      setError('Failed to add goal. Please try again.');
    }
  };

  const handleUpdateGoal = async () => {
    const userId = getCookie('id');

    if (!userId) {
      setError('User ID is missing. Please log in again.');
      return;
    }

    // Validate inputs
    const isValidNumber = (value: string) => /^[0-9]+(\.[0-9]+)?$/.test(value);

    if (
      GoalCals == ''
    ) {
      setError('Please enter valid numbers for all fields.');
      return;
    }

    try {
      const updatedGoal = {
        userId,
        calories: GoalCals,
        carbs: GoalCarb,
        fats: GoalFats,
        proteins: GoalProt,
      };

      const response = await axios.put('http://146.190.71.194:5000/api/goal/updateGoal', updatedGoal);

      if (response.data.success) {
        // Update numeric goal values
        setGoalCalories(Number(updatedGoal.calories));
        setGoalProtein(Number(updatedGoal.proteins));
        setGoalCarbs(Number(updatedGoal.carbs));
        setGoalFatsNumeric(Number(updatedGoal.fats)); // Updated setter

        closeGoalsPopup();
        console.log('Goal updated successfully!');
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      setError('Failed to update goal. Please try again.');
    }
  };

  const fetchGoal = async () => {
    const userId = getCookie('id');

    if (!userId) {
      setError('User ID is missing. Please log in again.');
      return;
    }

    try {
      const response = await axios.get('http://146.190.71.194:5000/api/goal/getGoal', {
        params: { userId },
      });

      if (response.data && response.data.data) {
        const goalData = response.data.data;

        setGoalCals(goalData.calories.toString());
        setGoalProt(goalData.proteins.toString());
        setGoalCarb(goalData.carbs.toString());
        setGoalFats(goalData.fats.toString());

        setGoalCalories(goalData.calories);
        setGoalProtein(goalData.proteins);
        setGoalCarbs(goalData.carbs);
        setGoalFatsNumeric(goalData.fats);

        setGoalExists(true);
      } else {
        setGoalExists(false);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setGoalExists(false);
      } else {
        console.error('Error fetching goal:', error);
        setError('Failed to fetch goal. Please try again.');
      }
    }
  };

  // Fetch meals and goals when the component mounts
  useEffect(() => {
    setFirstName(getCookie('firstName'));
    setLastName(getCookie('lastName'));

    // Fetch the user's goals
    fetchGoal();

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    fetchMeals();

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    meals.forEach((meal) => {
      totalCalories += meal.calories;
      totalProtein += meal.protein; // Changed to 'proteins'
      totalCarbs += meal.carbs;
      totalFats += meal.fats;
    });

    setCurrentCalories(totalCalories);
    setCurrentProtein(totalProtein);
    setCurrentCarbs(totalCarbs);
    setCurrentFats(totalFats);
  }, [meals]);

  const fetchMeals = async () => {
    const userId = getCookie('id'); // Retrieve the user ID from the cookie

    if (!userId) {
      setError('User ID is missing. Please log in again.');
      return;
    }

    try {
      const response = await axios.get('http://146.190.71.194:5000/api/ingredient/getMeals', {
        params: { userId },
      });

      if (response.data) {
        setMeals(response.data);
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
      setError('Failed to fetch meals. Please try again.');
    }
  };

  const hasLoginCookie = (): boolean => {
    const match = document.cookie.match(new RegExp('(^| )authToken=([^;]+)'));
    return !!match; // Returns true if the cookie exists, false otherwise
  };

  useEffect(() => {
    if (!hasLoginCookie()) {
      // Redirect to the homepage or login page if no login cookie is found
      navigate('/');
    }
  }, [navigate]);

  const handleDelete = async (mealId: string) => {
    try {
      const userId = getCookie('id'); // Retrieve the user ID from the cookie

      if (!userId) {
        setError('User ID is missing. Please log in again.');
        return;
      }

      // Call the API to delete the meal
      const response = await axios.delete('http://146.190.71.194:5000/api/ingredient/deleteMeal', {
        data: {
          userId,
          mealId,
        },
      });

      if (response.data.success) {
        // Update the meals state to remove the deleted meal
        setMeals((prevMeals) => prevMeals.filter((meal) => meal._id !== mealId));
        console.log('Meal deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
      setError('Failed to delete meal. Please try again.');
    }

    fetchMeals();
  };

  const showEditPopup = (meal: any) => {
    setEditMeal(meal); // Set the meal to be edited
    setEditPopupVisible(true); // Show the edit popup
  };
  

  const handleEdit = async () => {
    if (!editMeal) return;
  
    const userId = getCookie('id'); // Retrieve the user ID from the cookie
  
    if (!userId) {
      setError('User ID is missing. Please log in again.');
      return;
    }
  
    try {
      const response = await axios.put('http://146.190.71.194:5000/api/ingredient/updateMeal', {
        userId,
        mealId: editMeal._id, // Pass the meal's ID
        foodName: editMeal.foodName,
        calories: parseFloat(editMeal.calories),
        carbs: parseFloat(editMeal.carbs),
        fats: parseFloat(editMeal.fats),
        protein: parseFloat(editMeal.protein),
        weight: parseFloat(editMeal.weight),
      });
  
      if (response.data.success) {
        // Update the meals state with the edited meal
        setMeals((prevMeals) =>
          prevMeals.map((meal) => (meal._id === editMeal._id ? { ...meal, ...editMeal } : meal))
        );
        
        fetchMeals();
        setEditPopupVisible(false); // Close the edit popup
        setEditMeal(null); // Clear the edit meal state
      }
    } catch (error) {
      console.error('Error editing meal:', error);
      setError('Failed to edit meal. Please try again.');
    }
  };

  const handleLogout = () => {
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'firstName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'lastName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'; // Clear the id cookie
    navigate('/');
  };

  const handleAdd = async () => {
    const isValidNumber = (value: string) => /^[0-9]+(\.[0-9]+)?$/.test(value);

    if (!name || !calories || !carbs || !fats || !proteins || !weight) {
      setError('All fields must be filled with valid numbers.');
      return;
    }

    if (
      !isValidNumber(calories) ||
      !isValidNumber(carbs) ||
      !isValidNumber(fats) ||
      !isValidNumber(proteins) ||
      !isValidNumber(weight)
    ) {
      setError(
        'All fields must contain valid integers or decimals without starting or ending with a decimal.'
      );
      return;
    }

    setError(''); // Clear error if inputs are valid

    try {
      const userId = getCookie('id'); // Retrieve the user ID from the cookie

      if (!userId) {
        setError('User ID is missing. Please log in again.');
        return;
      }

      const newMeal = {
        userId,
        foodName: name,
        calories: parseFloat(calories),
        carbs: parseFloat(carbs),
        fats: parseFloat(fats),
        protein: parseFloat(proteins), // Changed to 'proteins'
        weight: parseFloat(weight),
      };

      const response = await axios.post(
        'http://146.190.71.194:5000/api/ingredient/addIngredient',
        newMeal
      );

      if (response.data) {
        // Update meals state with the new meal
        setMeals((prevMeals) => [...prevMeals, response.data.data]);
        console.log('Success!');
        closePopup();
      }
    } catch (error) {
      console.error('Error adding meal:', error);
      setError('Failed to add meal. Please try again.');
    }
  };

  const formatWithUnit = (value: string, unit: string) => {
    return `${value}${unit}`;
  };

  return (
    <>
      <div id="stars-container">
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
      </div>

      <div className="Nutrition_box">
        <p className="Nutrition_box_title">Goals</p>
        <hr />
        <div className="Nutrition_box_items">
          <p>Calories: {GoalCals}</p>
          <p>Protein: {formatWithUnit(String(GoalProt), "g")}</p>
          <p>Carbs: {formatWithUnit(String(GoalCarb), "g")}</p>
          <p>Fats: {formatWithUnit(String(GoalFats), "g")}</p>
          <button className="Nutrition_box_button" onClick={showGoalsPopup}>
            Edit
          </button>
          {isGoalsPopupVisible && (
            <div className="GoalChangeOverlay">
              <div className="GoalChangePopup">
                <h2>Update Your Goals</h2>
                {error && <div className="GoalsError" style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
                <div className="GroupEntryGrid">
                  <div className="subtitles">Calories</div>
                  <input
                    type="text"
                    id="Cals"
                    name="Cals"
                    value={GoalCals}
                    onChange={handleGoalCalChange}
                    placeholder="Calories"
                    className="GoalInputBoxes"
                  />
                  <div> </div>
                  <div className="subtitles">Carbohydrates</div>
                  <input
                    type="text"
                    id="Carbs"
                    name="Carbs"
                    value={GoalCarb}
                    onChange={handleGoalCarbChange}
                    placeholder="Carbohydrates (g)"
                    className="GoalInputBoxes"
                  />
                  <input
                    className="GoalInputBoxes"
                    type="number"
                    id="%carb"
                    value={GoalCarbPercent}
                    onChange={handleGoalCarbPercentChange}
                    placeholder="%"
                  />
                  <div className="subtitles">Protein</div>
                  <input
                    type="text"
                    id="Prot"
                    name="Prot"
                    value={GoalProt}
                    onChange={handleGoalProteinChange}
                    placeholder="Protein (g)"
                    className="GoalInputBoxes"
                  />
                  <input
                    type="number"
                    className="GoalInputBoxes"
                    id="%prot"
                    value={GoalProtPercent}
                    onChange={handleGoalProtPercentChange}
                    placeholder="%"
                  />
                  <div className="subtitles">Fats</div>
                  <input
                    type="text"
                    id="Fats"
                    name="Fats"
                    value={GoalFats}
                    onChange={handleGoalFatChange}
                    placeholder="Fats (g)"
                    className="GoalInputBoxes"
                  />
                  <input
                    type="number"
                    className="GoalInputBoxes"
                    id="%fats"
                    value={GoalFatPercent}
                    onChange={handleGoalFatPercentChange}
                    placeholder="%"
                  />
                </div>
                <div>
                  <button onClick={handleSaveGoal}>Save</button>
                  <div className="x-add" onClick={closeGoalsPopup}>
                    &times;
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="background-menu">
        <div className="title-container">
          <span className={`title_mode ${isChartMode ? 'fade-in' : 'fade-out'}`}>Entries</span>
          <span className={`title_mode ${!isChartMode ? 'fade-in' : 'fade-out'}`}>Nutrition</span>
        </div>
      </div>
      <div className="table-container">
        <div className="table-content">
          {/* Updated table to include weight column */}
          <div className={`nutrition-table-wrapper ${isChartMode ? 'fade-in' : 'fade-out'}`}>
            <table className="nutrition-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Calories</th>
                  <th>Carbs (g)</th>
                  <th>Fats (g)</th>
                  <th>Protein (g)</th>
                  <th>Weight (g)</th>
                  <th style={{ color: 'black' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {meals.map((meal, index) => (
                  <tr key={index}>
                    <td className="name-cell-wrap">{meal.foodName}</td>
                    <td className="name-cell-wrap">{meal.calories}</td>
                    <td className="name-cell-wrap">{meal.carbs}</td>
                    <td className="name-cell-wrap">{meal.fats}</td>
                    <td className="name-cell-wrap">{meal.protein}</td> {/* Changed to 'proteins' */}
                    <td className="name-cell-wrap">{meal.weight}</td>
                    <td className="name-cell-wrap">
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <button className="pen" onClick={() => showEditPopup(meal)}>
                          <img src={edit} />
                        </button>
                        <button className="trash" onClick={() => handleDelete(meal._id)}>
                          <img src={del} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`nutrition-section-wrapper ${!isChartMode ? 'fade-in' : 'fade-out'}`}>
          <h2 style={{ position: 'absolute', left: '23%', top: '8%' }}>Calories</h2>
          <ProgressBar
            value={currentCalories}
            max={goalCalories}
            classNameBar="progress-bar-calories"
            classNameFill="fill-bar-calories"
            showGrams={false}
          />

          <h2 style={{ position: 'absolute', right: '23.5%', bottom: '23%' }}>Protein</h2>
          <ProgressBar
            value={currentProtein}
            max={goalProtein}
            classNameBar="progress-bar-protein"
            classNameFill="fill-bar-protein"
            showGrams={true}
          />

          <h2 style={{ position: 'absolute', right: '25.5%', top: '8%' }}>Fats</h2>
          <ProgressBar
            value={currentFats}
            max={goalFats}
            classNameBar="progress-bar-fats"
            classNameFill="fill-bar-fats"
            showGrams={true}
          />

          <h2 style={{ position: 'absolute', left: '19.5%', bottom: '23%' }}>Carbohydrates</h2>
          <ProgressBar
            value={currentCarbs}
            max={goalCarbs}
            classNameBar="progress-bar-carbs"
            classNameFill="fill-bar-carbs"
            showGrams={true}
          />
        </div>
      </div>

      <div className="container">
        <input
          type="checkbox"
          id="toggle"
          style={{ display: 'none' }}
          onChange={handleToggle}
          checked={!isChartMode}
        />
        <label htmlFor="toggle" className="toggle-button">
          <span className={`emoji ${isChartMode ? 'fade-in' : 'fade-out'}`}>📊</span>
          <span className={`emoji ${!isChartMode ? 'fade-in' : 'fade-out'}`}>🍎</span>
        </label>
      </div>

      <div className={`plus-button-wrapper ${isChartMode ? 'fade-in' : 'fade-out'}`}>
        <div className="plus-button" onClick={showPopup}>
          <img src={plus} className="plus-button" alt="Add" />
        </div>
      </div>

      {isEditPopupVisible && (
        <div className="overlay">
          <div className="popup-add" onClick={(e) => e.stopPropagation()}>
            <div className="x-add" onClick={() => { setEditPopupVisible(false); setError('');}}>
              &times;
            </div>
            <div className="add-title">Edit Meal</div>

            {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

            <input
              type="text"
              value={editMeal?.foodName || ''}
              onChange={(e) => setEditMeal({ ...editMeal, foodName: e.target.value })}
              placeholder="Name"
              className="circular-input"
            />
            <input
              type="text"
              value={editMeal?.calories || ''}
              onChange={(e) => setEditMeal({ ...editMeal, calories: e.target.value })}
              placeholder="Calories"
              className="circular-input"
            />
            <input
              type="text"
              value={editMeal?.carbs || ''}
              onChange={(e) => setEditMeal({ ...editMeal, carbs: e.target.value })}
              placeholder="Carbohydrates (g)"
              className="circular-input"
            />
            <input
              type="text"
              value={editMeal?.fats || ''}
              onChange={(e) => setEditMeal({ ...editMeal, fats: e.target.value })}
              placeholder="Fats (g)"
              className="circular-input"
            />
            <input
              type="text"
              value={editMeal?.protein || ''}
              onChange={(e) => setEditMeal({ ...editMeal, protein: e.target.value })}
              placeholder="Proteins (g)"
              className="circular-input"
            />
            <input
              type="text"
              value={editMeal?.weight || ''}
              onChange={(e) => setEditMeal({ ...editMeal, weight: e.target.value })}
              placeholder="Weight (g)"
              className="circular-input"
            />

            <div>
              <button style={{ marginTop: '25px' }} onClick={handleEdit}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isPopupVisible && (
        <div className="overlay">
          <div className="popup-add" onClick={(e) => e.stopPropagation()}>
            <div className="x-add" onClick={closePopup}>
              &times;
            </div>
            <div className="add-title">Add Meal</div>

            {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Name"
              className="circular-input"
            />
            <input
              type="text"
              value={calories}
              onChange={handleCalorieChange}
              placeholder="Calories"
              className="circular-input"
            />
            <input
              type="text"
              value={carbs}
              onChange={handleCarbChange}
              placeholder="Carbohydrates (g)"
              className="circular-input"
            />
            <input
              type="text"
              value={fats}
              onChange={handleFatChange}
              placeholder="Fats (g)"
              className="circular-input"
            />
            <input
              type="text"
              value={proteins}
              onChange={handleProteinChange}
              placeholder="Proteins (g)"
              className="circular-input"
            />
            <input
              type="text"
              value={weight}
              onChange={handleWeightChange}
              placeholder="Weight (g)"
              className="circular-input"
            />

            <div>
              <button style={{ marginTop: '25px' }} onClick={handleAdd}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="profile-container">
        <img src={pfp} className="profile" alt="Profile" />
        <div onClick={() => setIsDropdownOpen((prev) => !prev)} ref={profileRef}>
          <img
            src={arrow}
            className={`arrow ${isDropdownOpen ? 'rotate' : ''}`}
            alt="Toggle Dropdown"
          />
        </div>
        <div
          className={`dropdown-menu ${isDropdownOpen ? 'show' : 'hide'}`}
          ref={dropdownRef}
        >
          <p className="profile-name">
            {firstName} {lastName}
          </p>
          <button className="logout-button" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>

      <div>
        <img src={KnightLogo} className="logo" alt="Knight logo" />
      </div>
    </>
  );
};

export default Landing;