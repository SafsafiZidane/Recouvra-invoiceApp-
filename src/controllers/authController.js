const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const generateToken = require("../lib/utils");




const register = async(req,res) =>{
    console.log('i reached it');
    try {       
    const {name,email,password,role} = req.body ;

     if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);

    const newUser = new User({
          name,
          email,
          password: hashedPassword,
          role
        });
        await newUser.save();
        res.status(201).json({message : `User registered with email ${email}`})

            } catch (error) {
                res.status(500).json({message : "something went wrong"})
        
    }
};


const login = async(req,res) =>{

    try {
    const {email,password} = req.body;

    const user = await User.findOne({email}).select('+password');
    
    if(!user) return res.status(401).json({message : `User with email ${email} not found`});

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({message : "invalid crendentails"})

    user.lastLogin = new Date();
    await user.save()
    const token = generateToken(user._id,user.role,res);
    return res.status(200).json({ 
      status: 'success',
      token,
      user: {
        id: user._id,
        role: user.role,
      }
    });


    
    
        
    } catch (error) {
        res.status(500).json({message : "something went wrong"});
        console.log(error)
        
    }

};


module.exports = { 
    login,
    register
}