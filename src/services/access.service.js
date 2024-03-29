"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, AuthFailureError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};
class AccessService {
  static login = async ({ email, password, refreshToken = null }) => {
    /*
        1 - Check email in dbs
        2 - Match Password
        3 - Create AT and RT and save
        4 - Generate Token
        5 - Get data
        */
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestError(`Shop not Registered`);
    }

    const match = bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError("Authentication Error");

    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");
    
    const {_id : userId} = foundShop
    const tokens = await createTokenPair(
      { userId },
      publicKey,
      privateKey
    );

    await KeyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey,
      userId
    });

    return {
      shop: getInfoData({ field: ["_id", "name", "email"], object: foundShop }),
      tokens,
    };
  };
  static signUp = async ({ name, email, password }) => {
    // try {
    // check email exists?
    const holderShop = await shopModel.findOne({ email }).lean();
    if (holderShop) {
      throw new BadRequestError("Error: Shop Already Registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });
    if (newShop) {
      // created privateKey, publicKey

      // const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa',{
      //     modulusLength: 2048,
      //     publicKeyEncoding: {
      //         type: 'pkcs1',
      //         format: 'pem'
      //     },
      //     privateKeyEncoding: {
      //         type: 'pkcs1',
      //         format: 'pem'
      //     }

      // })

      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      console.log({ privateKey, publicKey }); //save collections keyStore

      const keyStore = await KeyTokenService.createKeyToken({
        userID: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        throw new BadRequestError("Error: Create KeyStore Failed");
      }
      // created token pair
      const tokens = await createTokenPair(
        { userID: newShop._id, email },
        publicKey,
        privateKey
      );
      console.log(`Create Token Successfully`, tokens);

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fields: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens,
        },
      };
    }

    return {
      code: 200,
      metadata: null,
    };

    // } catch (error) {
    //     console.error(error)
    //     return {
    //         code: 'xxx',
    //         message: error.message,
    //         status: 'error'
    //     }

    // }
  };
}

module.exports = AccessService;
