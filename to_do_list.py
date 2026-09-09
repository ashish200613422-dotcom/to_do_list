from fastapi import FastAPI,Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from dotenv import load_dotenv
import os
load_dotenv()
mongourl=os.getenv("MONGO_URL")
client=MongoClient(mongourl)
db=client["my_database"]
collection=db["my_list"]

app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class work(BaseModel):
    name:str
    day:str
    task:str

class task_not_found(Exception):
    pass
@app.exception_handler(task_not_found)
async def product_error_handler(request:Request,exp:task_not_found):
    return JSONResponse(
        status_code=404,
        content="task not found"
    )

@app.get("/")
def show():
    products=list(collection.find())
    for product in products:
        product["_id"]=str(product["_id"])
    return products

@app.post("/")
def addtask(inf:work):
    result=collection.insert_one(inf.model_dump())
    return "added successfully"

@app.put("/{name}")
def updatetasks(inf:work,name:str):
    result=collection.update_one({"name":name},{"$set":inf.model_dump()})
    if result.matched_count==0:
        raise task_not_found()
    return "updated successfully"

@app.delete("/{name}")
def delthis(name:str):
    result=collection.delete_one({"name":name})
    if result.deleted_count==0:
        raise task_not_found()
    return "deleted sucessfully"



