from fastapi import FastAPI
import pandas as pd
import numpy as np
import pickle
from pydantic import BaseModel
import requests
from sklearn.metrics.pairwise import cosine_similarity
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5173",  # Vite dev server
]

app= FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # or ["*"] for all origins (not recommended in prod)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

distance_similarity = pickle.load(open('distance_similarity.pkl','rb'))
new_movies=pickle.load(open('movie_list.pkl','rb'))
x=pickle.load(open('x.pkl','rb'))

class MovieRequest(BaseModel):
    title: str

@app.get('/get_movies_names')
def g():
    return {'movies': new_movies['title'].tolist()}

@app.post('/recommend')
def f(req: MovieRequest):
    title = req.title
    def fetch_poster(movie_id):
        url = "https://api.themoviedb.org/3/movie/{}?api_key=8265bd1679663a7ea12ac168da84d2e8&language=en-US".format(movie_id)
        data = requests.get(url)
        data = data.json()
        poster_path = data['poster_path']
        full_path = "https://image.tmdb.org/t/p/w500/" + poster_path
        return full_path

    def recommend(name,n=5):
        
        movies_index = new_movies.loc[(new_movies["title"] == name)].index[0]
        dist_simi = list(enumerate(distance_similarity[movies_index]))

        dist_simi.sort(reverse=True, key=lambda x: x[1])

        l=[new_movies['movie_id'][i[0]] for i in dist_simi[1:n+1]]
     
        recommend_movies=[]
        movies_posters=[]
        print(l)
        for i in range(0,n):
            recommend_movies.append(new_movies[new_movies['movie_id']==l[i]]['title'].values[0])
            movies_posters.append(fetch_poster(l[i]))
        return recommend_movies, movies_posters
    
    return {'message': f"do you want to recommend a movie like {title} ?",
            'recommendations': recommend(title)[0]
            , 'posters': recommend(title)[1]
            }