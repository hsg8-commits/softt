// Enhanced Standalone Socket.IO Server for Telegram Clone
// مع جميع المميزات المفقودة ومحسن للأداء

import { Server } from 'socket.io';
import { createServer } from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB Schemas
const { Schema, model } = mongoose;

// User Schema مع جميع الحقول المطلوبة
const UserSchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 20 },
  lastName: { type: String, default: "", maxLength: 20 },
  username: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 20,
    unique: true,
  },
  phone: { type: String, required: true, unique: true },
  avatar: { type: String, required: false },
  biography: { type: String, default: "", maxLength: 70 },
  type: { type: String, enum: ["private"], default: "private" },
  status: { type: String, enum: ["online", "offline"], default: "offline" },
  password: { type: String, required: true },
  roomMessageTrack: {
    type: [{ roomId: String, scrollPos: Number }],
    default: [],
  },
}, { timestamps: true });

// Message Schema مع دعم الملفات
const MessageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String },
  roomID: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  seen: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  readTime: { type: Date },
  voiceData: {
    src: String,
    duration: Number,
    playedBy: [String],
  },
  fileData: {
    name: String,
    size: Number,
    type: String,
    url: String,
  },
  createdAt: { type: Date, default: Date.now },
  tempId: { type: String, unique: true },
  status: {
    type: String,
    enum: ["pending", "sent", "failed"],
    default: "sent",
  },
  isEdited: { type: Boolean, default: false },
  hideFor: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  replays: [{ type: Schema.Types.ObjectId, ref: 'Message', default: [] }],
  replayedTo: Schema.Types.Mixed,
  pinnedAt: { type: Date, default: null },
}, { timestamps: true });

// Room Schema مع دعم القنوات والمجموعات
const RoomSchema = new Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["group", "private", "channel"],
    required: true,
  },
  avatar: String,
  description: String,
  biography: String,
  link: String,
  creator: { type: Schema.Types.ObjectId, ref: 'User' },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  admins: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message', required: true }],
  medias: [Schema.Types.Mixed],
  locations: [Schema.Types.Mixed],
}, { timestamps: true });

// Location Schema للمواقع
const LocationSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  roomID: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: String,
}, { timestamps: true });

// Media Schema للملفات
const MediaSchema = new Schema({
  file: { type: Buffer, required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  roomID: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  filename: String,
  mimetype: String,
  size: Number,
}, { timestamps: true });

// Namespace Schema للتنظيم
const NamespaceSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  rooms: [{ type: Schema.Types.ObjectId, ref: 'Room' }],
  creator: { type: Schema.Types.ObjectId, ref: 'User' },
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// Create models
const User = mongoose.models.User || model('User', UserSchema);
const Message = mongoose.models.Message || model('Message', MessageSchema);
const Room = mongoose.models.Room || model('Room', RoomSchema);
const Location = mongoose.models.Location || model('Location', LocationSchema);
const Media = mongoose.models.Media || model('Media', MediaSchema);
const Namespace = mongoose.models.Namespace || model('Namespace', NamespaceSchema);

// Connect to MongoDB with improved error handling
// ...
const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    if (mongoose.connection.readyState === 0) {
      // تم إزالة الخيارات غير المدعومة
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ Connected to MongoDB successfully');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};
// ...


// Initialize HTTP Server
const PORT = process.env.PORT || 3001;
const httpServer = createServer();

// Initialize Socket.IO with optimized settings
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 30000,
  pingInterval: 20000,
  maxHttpBufferSize: 1e6, // 1MB
  allowEIO3: true,
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
});

// Global state
let typings = [];
let onlineUsers = [];

// Utility functions
const formatTime = (timestamp, use24Hour = false) => {
  const date = new Date(timestamp);
  if (use24Hour) {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  return date.toLocaleTimeString('en-US', { 
    hour12: true, 
    hour: 'numeric', 
    minute: '2-digit' 
  });
};

const updateUserOnlineStatus = async (userID, status) => {
  try {
    await User.findByIdAndUpdate(userID, { status });
  } catch (error) {
    console.error('Error updating user status:', error);
  }
};

// Connect to DB before starting server
await connectDB();

console.log('🚀 Socket.IO server initializing...');

io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  // ==========================================
  // 🔥 User Data Management
  // ==========================================
  socket.on('updateUserData', async (data) => {
    try {
      const { userID, avatar, name, lastName, biography, username, phone } = data;
      
      console.log('📝 Updating user data:', { userID, name, lastName, username });

      if (!userID) {
        socket.emit('updateUserData', { 
          success: false, 
          error: 'User ID is required' 
        });
        return;
      }

      const updateFields = {};
      if (avatar !== undefined) updateFields.avatar = avatar;
      if (name !== undefined) updateFields.name = name;
      if (lastName !== undefined) updateFields.lastName = lastName;
      if (biography !== undefined) updateFields.biography = biography;
      if (username !== undefined) updateFields.username = username;
      if (phone !== undefined) updateFields.phone = phone;

      const updatedUser = await User.findByIdAndUpdate(
        userID,
        { $set: updateFields },
        { new: true, runValidators: true }
      ).select('name lastName username avatar biography phone _id');

      if (!updatedUser) {
        socket.emit('updateUserData', { 
          success: false, 
          error: 'User not found' 
        });
        return;
      }

      console.log('✅ User updated successfully:', updatedUser.username);

      socket.emit('updateUserData', { 
        success: true,
        user: updatedUser
      });

      // Update user data in all active sessions
      const userSockets = onlineUsers.filter(u => u.userID === userID.toString());
      userSockets.forEach(({ socketID }) => {
        io.to(socketID).emit('userDataUpdated', {
          avatar: updatedUser.avatar,
          name: updatedUser.name,
          lastName: updatedUser.lastName,
          biography: updatedUser.biography,
          username: updatedUser.username,
        });
      });

      // Update participant data in rooms
      if (avatar !== undefined || name !== undefined || lastName !== undefined) {
        const userRooms = await Room.find({
          participants: userID,
          type: 'private'
        }).select('_id participants');

        userRooms.forEach(room => {
          io.to(room._id.toString()).emit('participantAvatarUpdate', {
            userID,
            avatar: updatedUser.avatar,
            name: updatedUser.name,
            lastName: updatedUser.lastName,
          });
        });
      }

    } catch (updateError) {
      console.error('❌ Error updating user data:', updateError);
      socket.emit('updateUserData', { 
        success: false, 
        error: updateError.message || 'Failed to update user data' 
      });
    }
  });

  socket.on('getUserData', async (userID) => {
    try {
      console.log('📥 Fetching user data for:', userID);

      const user = await User.findById(userID)
        .select('name lastName username avatar biography phone _id status');

      if (!user) {
        socket.emit('getUserData', { 
          success: false, 
          error: 'User not found' 
        });
        return;
      }

      socket.emit('getUserData', { 
        success: true,
        user: user
      });

    } catch (fetchError) {
      console.error('❌ Error fetching user data:', fetchError);
      socket.emit('getUserData', { 
        success: false, 
        error: 'Failed to fetch user data' 
      });
    }
  });

  // ==========================================
  // 🔥 Enhanced Message Handling
  // ==========================================
  socket.on('newMessage', async (data, callback) => {
    try {
      const { roomID, sender, message, replayData, voiceData = null, tempId, fileData = null } = data;
      
      const msgData = {
        sender,
        message,
        roomID,
        seen: [],
        voiceData,
        fileData,
        createdAt: Date.now(),
        tempId,
        status: 'sent',
      };

      let newMsg = await Message.findOne({ tempId }).lean();

      if (newMsg) {
        // Message already exists
        socket.to(roomID).emit('newMessage', {
          ...newMsg,
          replayedTo: replayData ? replayData.replayedTo : null,
        });

        socket.emit('newMessageIdUpdate', { tempId, _id: newMsg._id });
        io.to(roomID).emit('lastMsgUpdate', newMsg);
        io.to(roomID).emit('updateLastMsgData', { msgData: newMsg, roomID });
        
        if (callback) callback({ success: true, _id: newMsg._id });
      } else {
        // Create new message
        newMsg = await Message.create(msgData);
        const populatedMsg = await Message.findById(newMsg._id)
          .populate('sender', 'name lastName username avatar _id')
          .lean();

        socket.to(roomID).emit('newMessage', {
          ...populatedMsg,
          replayedTo: replayData ? replayData.replayedTo : null,
        });

        socket.emit('newMessageIdUpdate', { tempId, _id: populatedMsg._id });
        io.to(roomID).emit('lastMsgUpdate', populatedMsg);
        io.to(roomID).emit('updateLastMsgData', { msgData: populatedMsg, roomID });

        // Handle reply
        if (replayData) {
          await Message.findOneAndUpdate(
            { _id: replayData.targetID },
            { $push: { replays: newMsg._id } }
          );
          newMsg.replayedTo = replayData.replayedTo;
          await newMsg.save();
        }

        await Room.findOneAndUpdate(
          { _id: roomID },
          { $push: { messages: newMsg._id } }
        );

        if (callback) callback({ success: true, _id: newMsg._id });
      }
    } catch (messageError) {
      console.error('❌ Error in newMessage:', messageError);
      if (callback) callback({ success: false, error: 'Failed to send message' });
    }
  });

  // ==========================================
  // 🔥 Enhanced Room Management
  // ==========================================
  socket.on('createRoom', async ({ newRoomData, message = null }) => {
    try {
      let isRoomExist = false;

      if (newRoomData.type === 'private') {
        isRoomExist = await Room.findOne({ name: newRoomData.name });
      } else {
        isRoomExist = await Room.findOne({ _id: newRoomData._id });
      }

      if (!isRoomExist) {
        let msgData = message;

        if (newRoomData.type === 'private') {
          newRoomData.participants = newRoomData.participants.map((data) => data?._id);
        }

        const newRoom = await Room.create(newRoomData);

        if (msgData) {
          const newMsg = await Message.create({
            ...msgData,
            roomID: newRoom._id,
          });
          msgData = newMsg;
          newRoom.messages = [newMsg._id];
          await newRoom.save();
        }

        socket.join(newRoom._id.toString());

        const otherRoomMembersSocket = onlineUsers.filter((data) =>
          newRoom.participants.some((pID) => data.userID === pID.toString())
        );

        otherRoomMembersSocket.forEach(({ socketID: userSocketID }) => {
          const socketID = io.sockets.sockets.get(userSocketID);
          if (socketID) socketID.join(newRoom._id.toString());
        });

        io.to(newRoom._id.toString()).emit('createRoom', newRoom);
      }
    } catch (createRoomError) {
      console.error('❌ Error in createRoom:', createRoomError);
    }
  });

  socket.on('joinRoom', async ({ roomID, userID }) => {
    try {
      const roomTarget = await Room.findOne({ _id: roomID });

      if (roomTarget && !roomTarget?.participants.includes(userID)) {
        roomTarget.participants = [...roomTarget.participants, userID];
        socket.join(roomID);
        await roomTarget.save();

        io.to(roomID).emit('joinRoom', { userID, roomID });
      }
    } catch (joinError) {
      console.error('❌ Error in joinRoom:', joinError);
    }
  });

  socket.on('deleteRoom', async (roomID) => {
    try {
      io.to(roomID).emit('deleteRoom', roomID);
      io.to(roomID).emit('updateLastMsgData', { msgData: null, roomID });
      await Room.findOneAndDelete({ _id: roomID });
      await Message.deleteMany({ roomID });
    } catch (deleteRoomError) {
      console.error('❌ Error in deleteRoom:', deleteRoomError);
    }
  });

  // ==========================================
  // 🔥 Enhanced Voice Message Handling
  // ==========================================
  socket.on('listenToVoice', async ({ userID, voiceID, roomID }) => {
    try {
      io.to(roomID).emit('listenToVoice', { userID, voiceID, roomID });

      const targetMessage = await Message.findOne({ _id: voiceID }).exec();
      const voiceMessagePlayedByList = targetMessage?.voiceData?.playedBy || [];

      if (!voiceMessagePlayedByList?.includes(userID)) {
        const userIdWithSeenTime = `${userID}_${new Date().toISOString()}`;
        targetMessage.voiceData.playedBy = [
          ...voiceMessagePlayedByList,
          userIdWithSeenTime,
        ];
        await targetMessage.save();
      }
    } catch (voiceError) {
      console.error('❌ Error in listenToVoice:', voiceError);
    }
  });

  socket.on('getVoiceMessageListeners', async (msgID) => {
    try {
      const message = await Message.findOne({ _id: msgID });
      const playedByIds = message?.voiceData?.playedBy || [];

      const playedByIdsWithoutSeenTime = playedByIds.map((id) =>
        id?.includes('_') ? id.split('_')[0] : id
      );

      const playedByUsersData = await User.find({
        _id: { $in: playedByIdsWithoutSeenTime },
      }).lean();

      const findUserSeenTimeWithID = (id) => {
        let seenTime = null;
        playedByIds.some((str) => {
          const extractedID = str?.includes('_') ? str.split('_')[0] : str;
          if (extractedID === id.toString()) {
            seenTime = str?.includes('_') ? str.split('_')[1] : null;
            return true;
          }
        });
        return seenTime;
      };

      const userDataWithSeenDate = playedByUsersData.map((data) => ({
        ...data,
        seenTime: findUserSeenTimeWithID(data._id.toString()),
      }));

      socket.emit('getVoiceMessageListeners', userDataWithSeenDate);
    } catch (listenersError) {
      console.error('❌ Error in getVoiceMessageListeners:', listenersError);
    }
  });

  // ==========================================
  // 🔥 Enhanced Message Operations
  // ==========================================
  socket.on('pinMessage', async (id, roomID, isLastMessage) => {
    try {
      io.to(roomID).emit('pinMessage', id);

      const messageToPin = await Message.findOne({ _id: id });

      messageToPin.pinnedAt = messageToPin?.pinnedAt ? null : Date.now();
      await messageToPin.save();

      if (isLastMessage) {
        io.to(roomID).emit('updateLastMsgData', {
          msgData: messageToPin,
          roomID,
        });
      }
    } catch (pinError) {
      console.error('❌ Error in pinMessage:', pinError);
    }
  });

  socket.on('updateLastMsgPos', async ({ roomID, scrollPos, userID, shouldEmitBack = true }) => {
    try {
      const userTarget = await User.findOne({ _id: userID });

      if (!userTarget) {
        console.log(`User not found: ${userID}`);
        return;
      }

      if (!userTarget.roomMessageTrack) {
        userTarget.roomMessageTrack = [];
      }

      const isRoomExist = userTarget.roomMessageTrack.some((room) => {
        if (room.roomId === roomID) {
          room.scrollPos = scrollPos;
          return true;
        }
      });

      if (!isRoomExist) {
        userTarget.roomMessageTrack.push({ roomId: roomID, scrollPos });
      }

      if (shouldEmitBack) {
        socket.emit('updateLastMsgPos', userTarget.roomMessageTrack);
      }

      await userTarget.save();
    } catch (posError) {
      console.error('❌ Error updating user data:', posError);
    }
  });

  // ==========================================
  // 🔥 Get Rooms with Enhanced Performance
  // ==========================================
  socket.on('getRooms', async (userID) => {
    try {
      const userRooms = await Room.find({
        participants: { $in: userID },
      }).lean();

      const userPvs = await Room.find({
        $and: [{ participants: { $in: userID } }, { type: 'private' }],
      })
        .lean()
        .populate('participants');

      for (const room of userRooms) {
        room.participants =
          userPvs.find((data) => data._id.toString() === room._id.toString())?.participants ||
          room.participants;
        socket.join(room._id.toString());
      }

      const existingUser = onlineUsers.find((user) => user.socketID === socket.id);
      if (!existingUser) {
        onlineUsers.push({ socketID: socket.id, userID });
        await updateUserOnlineStatus(userID, 'online');
      }

      io.to([...socket.rooms]).emit('updateOnlineUsers', onlineUsers);

      const getRoomsData = async () => {
        const promises = userRooms.map(async (room) => {
          const lastMsgData = room?.messages?.length
            ? await Message.findOne({ _id: room.messages.at(-1)?._id })
                .populate('sender', 'name lastName username avatar _id')
            : null;

          const notSeenCount = await Message.find({
            $and: [
              { roomID: room?._id },
              { sender: { $ne: userID } },
              { seen: { $nin: [userID] } },
            ],
          });

          return {
            ...room,
            lastMsgData,
            notSeenCount: notSeenCount?.length,
          };
        });

        return Promise.all(promises);
      };

      const rooms = await getRoomsData();
      socket.emit('getRooms', rooms);
    } catch (roomsError) {
      console.error('❌ Error in getRooms:', roomsError);
    }
  });

  // ==========================================
  // 🔥 Enhanced Joining Room
  // ==========================================
  socket.on('joining', async (query, defaultRoomData = null) => {
    try {
      let roomData = await Room.findOne({
        $or: [{ _id: query }, { name: query }],
      })
        .populate('messages')
        .populate('medias')
        .populate('locations')
        .populate({
          path: 'messages',
          populate: { 
            path: 'sender', 
            model: User,
            select: 'name lastName username avatar _id'
          },
        })
        .populate({
          path: 'messages',
          populate: {
            path: 'replays',
            model: Message,
          },
        });

      if (roomData && roomData?.type === 'private') {
        await roomData.populate('participants');
      }

      if (!roomData?._id) {
        roomData = defaultRoomData;
      }

      socket.emit('joining', roomData);
    } catch (joiningError) {
      console.error('❌ Error in joining:', joiningError);
    }
  });

  // ==========================================
  // 🔥 Message Operations (Delete, Edit, Seen)
  // ==========================================
  socket.on('deleteMsg', async ({ forAll, msgID, roomID }) => {
    try {
      if (forAll) {
        io.to(roomID).emit('deleteMsg', msgID);
        const userID = onlineUsers.find((ud) => ud.socketID == socket.id)?.userID;

        await Message.findOneAndDelete({ _id: msgID });

        const lastMsg = await Message.findOne({
          roomID: roomID,
          hideFor: { $nin: [userID] },
        })
        .sort({ createdAt: -1 })
        .populate('sender', 'name lastName username avatar _id');

        if (lastMsg) {
          io.to(roomID).emit('updateLastMsgData', { msgData: lastMsg, roomID });
        }

        await Room.findOneAndUpdate({ _id: roomID }, { $pull: { messages: msgID } });
      } else {
        socket.emit('deleteMsg', msgID);

        const userID = onlineUsers.find((ud) => ud.socketID == socket.id)?.userID;

        if (userID) {
          await Message.findOneAndUpdate(
            { _id: msgID },
            { $push: { hideFor: userID } }
          );
        }

        const lastMsg = await Message.findOne({
          roomID: roomID,
          hideFor: { $nin: [userID] },
        })
        .sort({ createdAt: -1 })
        .populate('sender', 'name lastName username avatar _id');

        if (lastMsg) {
          socket.emit('updateLastMsgData', { msgData: lastMsg, roomID });
        }
      }
    } catch (deleteError) {
      console.error('❌ Error in deleteMsg:', deleteError);
    }
  });

  socket.on('editMessage', async ({ msgID, editedMsg, roomID }) => {
    try {
      io.to(roomID).emit('editMessage', { msgID, editedMsg, roomID });
      const updatedMsgData = await Message.findOneAndUpdate(
        { _id: msgID },
        { message: editedMsg, isEdited: true }
      ).lean();

      if (!updatedMsgData) return;

      const lastMsg = await Message.findOne({ roomID })
        .sort({ createdAt: -1 })
        .lean()
        .populate('sender', 'name lastName username avatar _id');

      if (lastMsg && lastMsg._id.toString() === msgID) {
        io.to(roomID).emit('updateLastMsgData', {
          roomID,
          msgData: { ...updatedMsgData, message: editedMsg },
        });
      }
    } catch (editError) {
      console.error('❌ Error in editMessage:', editError);
    }
  });

  socket.on('seenMsg', async (seenData) => {
    try {
      io.to(seenData.roomID).emit('seenMsg', seenData);
      await Message.findOneAndUpdate(
        { _id: seenData.msgID },
        {
          $push: { seen: seenData.seenBy },
          $set: { readTime: new Date(seenData.readTime) },
        }
      );
    } catch (seenError) {
      console.error('❌ Error in seenMsg:', seenError);
    }
  });

  // ==========================================
  // 🔥 Room Member Management
  // ==========================================
  socket.on('getRoomMembers', async ({ roomID }) => {
    try {
      const roomMembers = await Room.findOne({ _id: roomID }).populate(
        'participants'
      );
      socket.emit('getRoomMembers', roomMembers.participants);
    } catch (err) {
      console.log(err);
      socket.emit('error', { message: 'Unknown error, try later.' });
    }
  });

  socket.on('updateRoomData', async (updatedFields) => {
    try {
      const { roomID, ...fieldsToUpdate } = updatedFields;

      const updatedRoom = await Room.findOneAndUpdate(
        { _id: roomID },
        { $set: fieldsToUpdate },
        { new: true }
      );

      if (!updatedRoom) {
        throw new Error('Room not found');
      }

      io.to(updatedFields.roomID).emit('updateRoomData', updatedRoom);

      const otherRoomMembersSocket = onlineUsers.filter((data) =>
        updatedRoom.participants.some((pID) => {
          if (data.userID === pID.toString()) return true;
        })
      );

      otherRoomMembersSocket.forEach(({ socketID: userSocketID }) => {
        const socketID = io.sockets.sockets.get(userSocketID);
        if (socketID) {
          socketID.emit('updateRoomData', updatedRoom);
        }
      });
    } catch (updateRoomError) {
      console.error('❌ Error updating room:', updateRoomError);
      socket.emit('updateRoomDataError', { message: updateRoomError.message });
    }
  });

  // ==========================================
  // 🔥 Typing Indicators
  // ==========================================
  socket.on('typing', (data) => {
    if (!typings.includes(data.sender.name)) {
      io.to(data.roomID).emit('typing', data);
      typings.push(data.sender.name);
    }
  });

  socket.on('stop-typing', (data) => {
    typings = typings.filter((tl) => tl !== data.sender.name);
    io.to(data.roomID).emit('stop-typing', data);
  });

  // ==========================================
  // 🔥 Connection Handling
  // ==========================================
  socket.on('disconnect', async () => {
    console.log('❌ Client disconnected:', socket.id);
    
    const disconnectedUser = onlineUsers.find((data) => data.socketID === socket.id);
    onlineUsers = onlineUsers.filter((data) => data.socketID !== socket.id);
    
    if (disconnectedUser) {
      await updateUserOnlineStatus(disconnectedUser.userID, 'offline');
    }
    
    io.to([...socket.rooms]).emit('updateOnlineUsers', onlineUsers);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Enhanced Socket.IO server is running on port ${PORT}`);
  console.log(`📡 CORS enabled for all origins`);
  console.log(`⚡ Performance optimizations enabled`);
  console.log(`🔥 All features from routes server integrated`);
});

// Enhanced error handling
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('Process terminated');
  });
});

export default io;
