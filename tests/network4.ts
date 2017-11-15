import * as assert from "assert";
import {
    Address4,
    Network,
    Network4,
} from "../src";


interface NetworkInfo {
    stringAddress: string;
    octetsAddress: number[];
    prefix: number;
    stringNetmask: string;
    octetsNetmask: number[];
    stringHostmask: string;
    octetsHostmask: number[];
    stringBroadcast: string;
    octetsBroadcast: number[];
    numAddresses: number;
    inputPrefix: string;
    inputAddress: string;
}


const IPV4_NETWORKS_VALID: NetworkInfo[] = (() => {
    /* tslint:disable:object-literal-sort-keys */
    return [{
        stringAddress: "192.168.0.0",
        octetsAddress: [192, 168, 0, 0],
        prefix: 24,
        stringNetmask: "255.255.255.0",
        octetsNetmask: [255, 255, 255, 0],
        stringHostmask: "0.0.0.255",
        octetsHostmask: [0, 0, 0, 255],
        stringBroadcast: "192.168.0.255",
        octetsBroadcast: [192, 168, 0, 255],
        numAddresses: 256,
    }, {
        stringAddress: "10.0.0.0",
        octetsAddress: [10, 0, 0, 0],
        prefix: 8,
        stringNetmask: "255.0.0.0",
        octetsNetmask: [255, 0, 0, 0],
        stringHostmask: "0.255.255.255",
        octetsHostmask: [0, 255, 255, 255],
        stringBroadcast: "10.255.255.255",
        octetsBroadcast: [10, 255, 255, 255],
        numAddresses: 16777216,
    }, {
        stringAddress: "148.56.0.0",
        octetsAddress: [148, 56, 0, 0],
        prefix: 20,
        stringNetmask: "255.255.240.0",
        octetsNetmask: [255, 255, 240, 0],
        stringHostmask: "0.0.15.255",
        octetsHostmask: [0, 0, 15, 255],
        stringBroadcast: "148.56.15.255",
        octetsBroadcast: [148, 56, 15, 255],
        numAddresses: 4096,
    }].map((network: NetworkInfo) => {
        network.inputPrefix = `${network.stringAddress}/${network.prefix}`;
        network.inputAddress = `${network.stringAddress}/${network.stringNetmask}`;
        return network;
    });
})();


function testNetwork(check: (net: Network4) => void) {
    IPV4_NETWORKS_VALID.forEach((data) => {
        check(new Network4(data.inputPrefix));
        check(new Network4(data.inputAddress));
    });
}


function describeTestNetwork(describeSuffix: string, inputAccessor: (data: NetworkInfo) => string) {
    describe(`public interface ${describeSuffix}`, function() {
        it("should have the correct types", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert(net instanceof Network);
                assert(net.getAddress() instanceof Address4);
                assert(net.getNetmask() instanceof Address4);
                assert(net.getHostmask() instanceof Address4);
                assert(net.getBroadcast() instanceof Address4);
            });
        });
        it("should match network address", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert.equal(net.getAddress().getIpString(), data.stringAddress);
                assert.deepEqual(net.getAddress().getOctets(), data.octetsAddress);
            });
        });
        it("should match netmask address", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert.equal(net.getNetmask().getIpString(), data.stringNetmask);
                assert.deepEqual(net.getNetmask().getOctets(), data.octetsNetmask);
            });
        });
        it("should match prefix", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert.equal(net.getPrefix(), data.prefix);
            });
        });
        it("should match hostmask address", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert.equal(net.getHostmask().getIpString(), data.stringHostmask);
                assert.deepEqual(net.getHostmask().getOctets(), data.octetsHostmask);
            });
        });
        it("should match broadcast address", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert.equal(net.getBroadcast().getIpString(), data.stringBroadcast);
                assert.deepEqual(net.getBroadcast().getOctets(), data.octetsBroadcast);
            });
        });
        it("should match number of addresses", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert.equal(net.getNumAddresses(), data.numAddresses);
            });
        });
        it("hosts should start with the first address", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert.equal(
                    net.hosts().next().value.getIpString(),
                    new Address4(data.octetsAddress).add([1]).getIpString(),
                );
            });
        });
        it("hosts should end with the last address", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert(net.hosts(new Address4(data.octetsBroadcast).substract([1])).next().done);
            });
        });
        it("should contains the first address", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert(net.contains(new Address4(data.octetsAddress).add([1])));
            });
        });
        it("should contains the last address", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert(net.contains(new Address4(data.octetsBroadcast).substract([1])));
            });
        });
        it("should NOT contains before the first address", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert(!net.contains(new Address4(data.octetsAddress).substract([1])));
            });
        });
        it("should NOT contains after the last address", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(inputAccessor(data));
                assert(!net.contains(new Address4(data.octetsBroadcast).add([1])));
            });
        });
    });

}


describe("Network4", function() {
    describe("constructor with prefix netmask", function() {
        it("should accept valid values", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(data.inputPrefix);
            });
        });
    });
    describe("constructor with address netmask", function() {
        it("should accept valid values", function() {
            IPV4_NETWORKS_VALID.forEach((data) => {
                const net = new Network4(data.inputAddress);
            });
        });
    });
    describeTestNetwork("from prefix", (data: NetworkInfo) => data.inputPrefix);
    describeTestNetwork("from address", (data: NetworkInfo) => data.inputAddress);
});
