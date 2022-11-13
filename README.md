# Assesment_YouthIndia


The task was to ask user for login with google account. And then once the user logged in, frtch all the data of his upcomming events.



Here I have created three api's for this task.

1. The first API is login. On hitting this api user will get a chrome login screen asking him to login with his google account. Once successsfully logged in then tokens with his login credentials will be saved.  

And if the user is already, logged in he will get a response that he is already logged in and so can directly fetch data.



2. The second API is getevent. On hitting this api the logged-in user will get all the details of the upcomming events.



3. The third API is optional. On hitting this the user will be logged out of his account. And needs to login again to get the events



Note: 
1. Except google's own API, no other third party api or module is used in completion of this project.

2. For purpose of saving the data, I used mongoDB. In mongoDB I am just saving only one document. So, Browser storage can also be used for this instead of MongoDB.

3. When running on your machine, on hitting the login API, the user will get a access error while trying to login with google. This is because I have only authenticated choosen email for testing purpose in my own developer console account. You can just change the info in the credentials.js file with your own developer console credentials and give access to the emails you want.




Thank You for viewing my project.