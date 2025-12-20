import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// In-memory list of users (temporary, until we use a real database)
const users: { id: number; email: string; passwordHash: string }[] = [];

export const register = async (_req:Request,res:Response)=>{
    try{
    const {email,password}=_req.body;
    if(!email || !password)
    {
        return res.status(400).json({error:"Email and password required"});
    }
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password,10);

    const newUser ={
        id: users.length+1,
        email,
        passwordHash
    };

    users.push(newUser);

    const jwtsecret = process.env.JWT_SECRET;
    if(!jwtsecret){
      console.error("JWT SECRET is not set to the environment variable");
      return res.status(500).json({error:"Server configuration error"});
    }
    const token = jwt.sign(
        {userId: newUser.id, email: newUser.email,},
        jwtsecret,
        { expiresIn: "3h"}
    );
    return res.status(201).json({
        message:"User registered successfully...",
        user:{
            id:newUser.id,
            email:newUser.email
        },
        token
    })
    }catch(err){
        console.error("register error:",err);
        return res.status(500).json({error:"Internal server error"});
    }
};

//login checking
export const login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
  
      // 1) Basic validation
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }
  
      // 2) Find user by email
      const existingUser = users.find((u) => u.email === email);
      if (!existingUser) {
        return res.status(400).json({ error: "Invalid email or password" });
      }
  
      // 3) Compare password with stored hash
      const passwordMatches = await bcrypt.compare(
        password,
        existingUser.passwordHash
      );
  
      if (!passwordMatches) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const jwtsecret = process.env.JWT_SECRET;

      if (!jwtsecret) {
        console.error("JWT_SECRET is not set!");
        return res.status(500).json({ error: "Server configuration error" });
      }
      // 4) Create a new JWT token
      const token = jwt.sign(
        { userId: existingUser.id, email: existingUser.email },
        jwtsecret,
        { expiresIn: "3h" }
      );
  
      // 5) Send back token and user info
      return res.json({
        message: "Login successful",
        user: { id: existingUser.id, email: existingUser.email },
        token
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  };