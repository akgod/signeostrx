const { Api, JsonRpc } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');  
const fetch = require('node-fetch'); 
const { TextDecoder, TextEncoder } = require('util');
const rpc = new JsonRpc('https://eos.newdex.one', { fetch }); 
const EosApi = require('eosjs-api')    //'http://172.31.212.127:8888',

const signatureProvider = new JsSignatureProvider(["PRIVATE KEY"]);
const api = new Api({ rpc, signatureProvider , textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

function sleep (time) {  
	return new Promise((resolve) => setTimeout(resolve, time));
}

        // ---------------------------- ①打包Actions ----------------------------
let actions = [{ // actions结构与上面相同，这是我们与链交互的“个性化参数”
        account: "eosio.token",
        name: 'transfer',
        authorization: [{
            actor: 'eostothemoon',
            permission: 'active',
        }],
        data: {
            "from":"eostothemoon",
            "to":"eostothemars",
            "quantity":"8.8888 EOS",
            "memo":"test-eos"
        },
}];

// class eos {

async function sendtrx() {
			let sActions = await api.serializeActions(actions);// 打包Actions

			const expireInSeconds = 1 * 60 * 60 // 1 hour
			
			const info = await rpc.get_info({})
			const chainDate = new Date(info.head_block_time + 'Z')
			let expiration = new Date(chainDate.getTime() + expireInSeconds * 1000)
			expiration = expiration.toISOString().split('.')[0]

			const block = await rpc.get_block(info.last_irreversible_block_num)

			const txHeader = {
				expiration,
				ref_block_num: info.last_irreversible_block_num & 0xFFFF,
				ref_block_prefix: block.ref_block_prefix
			}
			console.log("time----:"+ chainDate);

			var sAct=await api.serializeActions(actions);  // 打包Actions	
			var resultSet=new Set();
			var tx={
				expiration: txHeader.expiration,                     // 根据延迟时间与引用区块的时间计算得到的截止时间
				ref_block_num: txHeader.ref_block_num,             // 引用区块号，来自于查询到的引用区块的属性值
				ref_block_prefix: txHeader.ref_block_prefix,   // 引用区块前缀，来自于查询到的引用区块的属性值
				max_net_usage_words: 0,                     // 设置该事务的最大net使用量，实际执行时评估超过这个值则自动退回，0为不设限制,uint 原版： 1000+i
				max_cpu_usage_ms: 0,                        // 设置该事务的最大cpu使用量，实际执行时评估超过这个值则自动退回，0为不设限制,uint8
				compression: 'none',                        // 事务压缩格式，默认为none，除此之外还有zlib等,但是似乎对序列化后action的签名没有什么效果，无正负面影响，官方说对于大合约部署有节约NET的效果
				delay_sec: 0,                               // 设置延迟事务的延迟时间，一般不使用。
				context_free_actions: [],                   
				actions: sActions,                          // 将前面处理好的Actions对象传入。
				transaction_extensions: [],                 // 事务扩展字段，一般为空。
			};
			var sTx=api.serializeTransaction(tx);    // 打包事务
			var sign=await signatureProvider.sign({ // 本地签名。
				chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
				requiredKeys: signatureProvider.availableKeys,
				serializedTransaction: sTx
			})

			resultSet.add({
				serializedTransaction:sTx,
				transaction:tx,
				signatures:sign.signatures
			})

			let eos = EosApi({httpEndpoint: endPoints[i]});
				for(let x of resultSet){

					let tmp={
						"transaction": x.transaction,
						"signatures":x.signatures,
						"compression": "none"
					}				
		     		try{
						let result = await eos.pushTransaction(tmp);
						console.log(result);						
					}catch(e){
						console.log(e);
					}				
				}
				await sleep(8);
	}



(async () => {
        const result = await sendtrx();
    }
)();

