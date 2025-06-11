import { useEffect, useState } from 'react'
import Select from 'react-select';

function App() {
  const [option, setoption] = useState([])
  const [recommendations, setrecommendations] = useState([])
  const [poster, setposter] = useState([])
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const get_movies_names = async () => {
      const response = await fetch('http://localhost:8000/get_movies_names');
      const data = await response.json();

      const options = data['movies'].map(movie => ({ value: movie, label: movie }));
      setoption(options);
    };
    get_movies_names();
  }, []);

  const [selected, setSelected] = useState(null);
  const handleChange = (selectedOption) => {
    setSelected(selectedOption);
  };

  const onsubmit = async () => {
    if (!selected) return;
    

    setLoading(true);
    const response = await fetch('http://localhost:8000/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: selected.value
      }),
    });

    const data = await response.json();
    setrecommendations(data['recommendations']);
    setposter(data['posters']);

    setLoading(false);
  };

  const defaultOption = { value: 'Avatar', label: 'Avatar' };

  return (
    <>
      <div className='bg-gradient-to-r from-emerald-400 to-white min-h-screen w-full flex items-center justify-center px-4 py-8 sm:px-6'>
        <div className='bg-neutral-800 w-full max-w-5xl p-6 rounded-3xl'>
          <div className='flex justify-center'>
            <h1 className='text-3xl sm:text-5xl text-white font-serif text-center'>Movie Recommender</h1>
          </div>
          <p className='text-lg sm:text-xl text-white text-center mt-4'>Select a movie to get recommendations</p>

          <div className='flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 w-full'>
            <div className='w-full sm:w-[60%]'>
              <Select
                className='text-black'
                options={option}
                onChange={handleChange}
                defaultValue={defaultOption}
              />
            </div>
            <button
              onClick={onsubmit}
              className='bg-emerald-400 text-white px-4 py-2 rounded-xl w-full sm:w-auto cursor-pointer hover:bg-emerald-600'
            >
              Submit
            </button>
          </div>

          {loading ? 
            <div className="flex justify-center mt-10">
              <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            </div> :

            <div className="flex flex-wrap justify-center gap-6 mt-10">
            {recommendations.map((name, index) => (
              <div key={index} className="flex flex-col items-center w-36 sm:w-40">
                <img
                  src={poster[index]}
                  alt={name}
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                />
                <p className="mt-2 text-center font-semibold text-emerald-400 text-sm">{name}</p>
              </div>
            ))}
            </div>
          }
        </div>
      </div>
    </>
  );
}

export default App;
