from fastapi import FastAPI,Depends,HTTPException,Request
from fastapi.security import OAuth2PasswordBearer,OAuth2PasswordRequestForm
from authlib.integrations.starlette_client import OAuth
from pymongo import MongoClient
import jwt
from datetime import datetime,timezone,timedelta
from dotenv import load_dotenv
import os
load_dotenv()


mongourl=os.getenv("MONGO_URL")
client=MongoClient(mongourl)
db=client["my_database"]
collection=db["user_inf_data"]

app=FastAPI()
secret_key=os.getenv("jwt_secret")
ALGORITHM="HS256"

def create_access_token(user):
    expire=datetime.now(timezone.utc)+timedelta(minutes=30)
    data={
        "sub":str(user["_id"]),
        "email":user["email"],
        "exp":expire
        }
    token=jwt.encode(data,secret_key,algorithm=ALGORITHM)
    return token

oauth=OAuth()
oauth.register(name="google",client_secret=os.getenv("client_secret"),
client_id=os.getenv("client_id_google"),server_metadata_url = "https://accounts.google.com/.well-known/openid-configuration",
client_kwargs={
    "scope":"openid email profile"
})
@app.get("/auth/google")
async def google_login(request:Request):
    redirect_uri=request.url_for("google_callback")
    return await oauth.google.authorize_redirect(request,redirect_uri)

@app.get("/auth/google/callback")
async def google_callback(request:Request):
    token=await oauth.google.authorize_access_token(request)
    user_info=token["userinfo"]
    email=user_info["email"]
    name=user_info.get("name")
    picture=user_info.get("picture")

    user=collection.find_one({"email":email})

    if user is None:
        result=collection.insert_one({"email":email,"name":name,"picture":picture,"provider":"google"})
        user=collection.find_one({"_id":result.inserted_id})
    access_token=create_access_token(user)
    return{"message":"Google log in successful",
           "access_token":access_token,
            "token_type":"bearer",
            "user":{
                "email":email,
                "name":name,
                "picture":picture
            }}

