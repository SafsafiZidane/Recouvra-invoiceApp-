const Client = require('../models/client.model')



const CreateClient = async(req,res) => {

    try {
    const {name,email,phone,address,company,notes} = req.body;

        if (!name || !email || !phone || !address || !company || !notes) {
                      return res.status(400).json({ message: "All fields are required" });
        }

        const newClient = new Client({
      name,
      email,
      phone,
      address,
      company,
      notes,
    });
    await newClient.save();
    
} catch (error) {
    res.status(500).json({ message: "something went wrong" });
    console.log(error);
}



}

const getClients = async (req, res) => {
  try {
    const clients = await Client.find();

    res.status(200).json({
      count: clients.length,
      clients
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json(client);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateClient = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true, // return updated data
        runValidators: true
      }
    );

    if (!updatedClient) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({
      message: "Client updated",
      client: updatedClient
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByIdAndDelete(id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({
      message: "Client deleted"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {CreateClient,getClientById,getClients,updateClient,deleteClient};