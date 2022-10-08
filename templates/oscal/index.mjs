export const components = [
    {
        "uuid": "811b22a6-78c0-4acc-9a56-fd577d03a236",
        "type": "this-system",
        "type-uuid":"",
        "title": "SARCAT OSCAL Example",
        "description": "If SARCAT were to be large scale cloud service",
        "status": {
            "state": "fictional"
        }
    },
    {
        "uuid": "bb7fdc54-67f0-4595-8ee1-2268cd5cced0",
        "type": "3rd_party_service",
        "type-uuid":"ec77591b-bb85-4e19-999f-b9eec57f014c",
        "title": "Fictional IAAS (FIAAS)",
        "description": "Once upon a time",
        "props": [
            {
            "name": "leveraged-authorization-uuid",
            "value": "6b9b8eef-ae87-4dff-89ac-964932734e6c"
            },
            {
            "name": "implementation-point",
            "value": "external"
            },
            {
            "name": "inherited-uuid",
            "value": "8f2df33f-9871-4552-b466-7e13a087d49d"
            }
        ]
    },
    {
        "uuid": "7ef5ecd4-96e0-43e0-91a1-e5a87dfbea9c",
        "type": "3rd_party_service",
        "type-uuid":"ec77591b-bb85-4e19-999f-b9eec57f014c",
        "title": "FIAAS Cloud Compute Services",
        "description": "",
        "props": [
            {
            "name": "leveraged-authorization-uuid",
            "value": "6b9b8eef-ae87-4dff-89ac-964932734e6c"
            },
            {
            "name": "implementation-point",
            "value": "external"
            },
            {
            "name": "inherited-uuid",
            "value": "8f2df33f-9871-4552-b466-7e13a087d49d"
            }
        ],
        "status": {
            "state": "operational"
        }
    },
    {
        "uuid": "e0cfc1e2-90ab-420f-b5f7-4fd743625385",
        "type": "3rd_party_service",
        "type-uuid":"ec77591b-bb85-4e19-999f-b9eec57f014c",
        "title": "FIAAS Cloud Data Services",
        "description": "",
        "props": [
            {
            "name": "leveraged-authorization-uuid",
            "value": "6b9b8eef-ae87-4dff-89ac-964932734e6c"
            },
            {
            "name": "implementation-point",
            "value": "external"
            },
            {
            "name": "inherited-uuid",
            "value": "8f2df33f-9871-4552-b466-7e13a087d49d"
            }
        ],
        "status": {
            "state": "operational"
        }
    },
    {
        "uuid": "f7008aca-20bf-4851-a8bb-9e85d127237f",
        "type": "3rd_party_service",
        "type-uuid":"ec77591b-bb85-4e19-999f-b9eec57f014c",
        "title": "FIAAS Cloud Network Services",
        "description": "",
        "props": [
            {
            "name": "leveraged-authorization-uuid",
            "value": "6b9b8eef-ae87-4dff-89ac-964932734e6c"
            },
            {
            "name": "implementation-point",
            "value": "external"
            },
            {
            "name": "inherited-uuid",
            "value": "8f2df33f-9871-4552-b466-7e13a087d49d"
            }
        ],
        "status": {
            "state": "operational"
        }
    },
    {
        "uuid": "8dc0b780-d50d-4799-96c6-876e592e2764",
        "type": "interconnection",
        "type-uuid":"fe70e195-fb87-428a-9b9c-7290872b9020",
        "title": "Identity Service Provider (IDP)",
        "description": "3rd Party Provider of Identity Services",
        "props": [
            {
                "name": "interconnect@service-provider.company-name",
                "ns":  "https://sarcat.io/oscal/ns",
                "value": "Okta, Inc."
            },
            {
                "name": "interconnect@network.endpoint",
                "type-uuid":"bf292c22-987c-49b0-8ca8-458ce76d86a7",
                "ns":  "https://sarcat.io/oscal/ns",
                "value": "https://sarcat.okta.com/auth"
            },
            {
                "name": "interconnect@network.fqdn",
                "type-uuid":"ee49453d-1d9a-4ae2-afc2-20252dee7764",
                "ns":  "https://sarcat.io/oscal/ns",
                "value": "sarcat.okta.com",
                "class": "remote"
            },
            {
                "name": "interconnect@network.subnet",
                "type-uuid":"3cd4e1bd-4f57-4c1a-8e34-87ef3d5deab0",
                "ns":  "https://sarcat.io/oscal/ns",
                "value": "10.10.0.0/16",
                "class": "internal"
            },
            {
                "name": "interconnect@network.circuit.id",
                "type-uuid":"c80cd54b-fc1a-454a-a273-a938fe0b3459",
                "ns":  "https://sarcat.io/oscal/ns",
                "value": "24742b44-2480-4edb-8250-e7102468dd89",
                "class": "a-side"
            },
            {
                "name": "interconnect@network.circuit.id",
                "type-uuid":"c80cd54b-fc1a-454a-a273-a938fe0b3459",
                "ns":  "https://sarcat.io/oscal/ns",
                "value": "okta:8fb8373f-4bf0-44ef-839e-a3c570ca7ea7",
                "class": "z-side"
            }
        ],
        "links": [
            {
            "href": "8e50dbeb-33c2-4590-9b4b-3a16c94d6c59",
            "rel": "isa-agreement"
            }
        ],
        "status": {
            "state": "operational"
        },
        "responsible-roles": [
            {
            "role-id": "isa-poc-remote",
            "party-uuids": [
                "09ad840f-aa79-43aa-9f22-25182c2ab11b"
            ]
            },
            {
            "role-id": "isa-poc-local",
            "party-uuids": [
                "09ad840f-aa79-43aa-9f22-25182c2ab11b"
            ]
            },
            {
            "role-id": "isa-authorizing-official-remote",
            "party-uuids": [
                "09ad840f-aa79-43aa-9f22-25182c2ab11b"
            ]
            },
            {
            "role-id": "isa-authorizing-official-local",
            "party-uuids": [
                "09ad840f-aa79-43aa-9f22-25182c2ab11b"
            ]
            }
        ],
        "remarks": "Utilized both by end cusstomers and by customer support"
    },
    {
        "uuid": "e6a53093-36ea-4734-9a21-31b8b9d084a7",
        "type": "service_offering",
        "type-uuid":"e02da0d5-bd6b-4ef6-ba55-a32847493f7e",
        "title": "Authorization Lifecycle Automation",
        "description": "Primary Product Service Provided to Customers",
        "props": [
            {
                "name": "product@name",
                "ns":  "https://sarcat.io/oscal/ns",
                "value": "SARCAT"
            },
            {
                "name": "product@version",
                "ns":  "https://sarcat.io/oscal/ns",
                "value": "1.0"
            },
            {
                "name": "product@network.endpoint",
                "type-uuid":"bf292c22-987c-49b0-8ca8-458ce76d86a7",
                "ns":  "https://sarcat.io/oscal/ns",
                "value": "https://sarcat.io:8443/service",
                "class": "public",
                "uuid": "359eaef9-ba29-4a00-af2b-1cd911aa61d7",
            },
            {
                "name": "product@network.endpoint",
                "type-uuid":"bf292c22-987c-49b0-8ca8-458ce76d86a7",
                "ns":  "https://sarcat.io/oscal/ns",
                "value": "https://sarcatops.net:8443/service",
                "class": "private",
                "uuid": "94d7c1f4-4293-43fd-afcd-f8452e199775",
            },
            {
                "name": "product@network.fqdn",
                "type-uuid":"ee49453d-1d9a-4ae2-afc2-20252dee7764",
                "ns":  "https://sarcat.io/oscal/ns",
                "value": "sarcat.io",
                "class": "self.public",
                "uuid":"54ff91fa-3a20-49c0-a29d-90f6ec43b899"
            },
            {
                "name": "product@network.fqdn",
                "type-uuid":"ee49453d-1d9a-4ae2-afc2-20252dee7764",
                "ns":  "https://sarcat.io/oscal/ns",
                "value": "sarcatops.net",
                "class": "self.private",
                "uuid":"d880f616-95e3-406f-931e-2eec201da85e"
            },
            {
                "name": "product@network.subnet",
                "type-uuid":"3cd4e1bd-4f57-4c1a-8e34-87ef3d5deab0",
                "ns":  "https://sarcat.io/oscal/ns",
                "value": "172.253.115.0/24",
                "class": "public",
                "uuid":"72fe66bb-06d5-41e3-b300-97d8c433c315"
            },
            {
                "name": "product@network.subnet",
                "type-uuid":"3cd4e1bd-4f57-4c1a-8e34-87ef3d5deab0",
                "ns":  "https://sarcat.io/oscal/ns",
                "value": "172.253.116.0/24",
                "class": "public",
                "uuid":"caac3f3d-1186-4112-8941-d2b4b9405e0d"
            },
            {
                "name": "product@network.subnet",
                "type-uuid":"3cd4e1bd-4f57-4c1a-8e34-87ef3d5deab0",
                "ns":  "https://sarcat.io/oscal/ns",
                "value": "172.253.117.0/24",
                "class": "public",
                "uuid":"62f896c8-d68a-41dc-abaa-32f6c28a1520"
            },
            {
                "name": "product@network.subnet",
                "type-uuid":"3cd4e1bd-4f57-4c1a-8e34-87ef3d5deab0",
                "ns":  "https://sarcat.io/oscal/ns",
                "value": "10.10.115.0/24",
                "class": "private",
                "uuid":"dade2857-f1b9-4731-b903-3eea31f480b4"
            },
            {
                "name": "product@network.subnet",
                "type-uuid":"3cd4e1bd-4f57-4c1a-8e34-87ef3d5deab0",
                "ns":  "https://sarcat.io/oscal/ns",
                "value": "10.10.116.0/24",
                "class": "private",
                "uuid":"55cb1fd0-5782-4ceb-9a24-1561edc3cc5a"
            },
            {
                "name": "product@network.subnet",
                "type-uuid":"3cd4e1bd-4f57-4c1a-8e34-87ef3d5deab0",
                "ns":  "https://sarcat.io/oscal/ns",
                "value": "10.10.17.0/24",
                "class": "private",
                "uuid":"ac8f4145-51d0-4d2c-a86e-98d26722c3bd"
            },
            {
                "name": "product@network.internet-gateway.id",
                "type-uuid":"c5b2c8a8-18ad-4442-b401-5f12e600d3cb",
                "ns":  "https://sarcat.io/oscal/ns",
                "value": "11711f62-caa9-4e5c-8030-ca98e09acaa3"
            },
            {
                "name": "product@network.interconnect-gateway.id",
                "type-uuid":"c5b2c8a8-18ad-4442-b401-5f12e600d3cb",
                "ns":  "https://sarcat.io/oscal/ns",
                "value": "fd7f2cd2-4187-4ab6-a0e9-6c2516a81770"
            },
            {
                "name": "product@network.internal-gateway.id",
                "type-uuid":"c5b2c8a8-18ad-4442-b401-5f12e600d3cb",
                "ns":  "https://sarcat.io/oscal/ns",
                "value": "598a1bb0-d9fe-4a0e-bcdd-28d438f6f109"
            }
        ],
        "links": [
            {
            "href": "c62e3952-dcd7-4639-b268-d21bc4271dad",
            "rel": "architecture"
            }
        ],
        "status": {
            "state": "operational"
        },
        "remarks": "this is the product/service provided to customers by this system"
    },
]

export const inventoryItems = [

]

/*
Components
this.system
    services
        product
            external product endpoints
            internal product execution services (app server to)
        support, O&M
            external (interconnects and services e.g., nntp, dns)
            internal support end points (auth, data, compute)






metaschema for inventory: /Users/brianthompson/Code/SARCAT/OSCAL/src/metaschema/oscal_implementation-common_metaschema.xml


<constraint>
<allowed-values target="prop/@name" allow-other="yes">
    <enum value="ipv4-address">The Internet Protocol v4 Address of the asset.</enum>
    <enum value="ipv6-address">The Internet Protocol v6 Address of the asset.</enum>
    <enum value="fqdn">The full-qualified domain name (FQDN) of the asset.</enum>
    <enum value="uri">A Uniform Resource Identifier (URI) for the asset.</enum>
    <enum value="serial-number">A serial number for the asset.</enum>
    <enum value="netbios-name">The NetBIOS name for the asset.</enum>
    <enum value="mac-address">The media access control (MAC) address for the asset.</enum>
    <enum value="physical-location">The physical location of the asset's hardware (e.g., Data Center ID, Cage#, Rack#, or other meaningful location identifiers).</enum>
    <enum value="is-scanned">is the asset subjected to network scans? (yes/no)</enum>
    <!-- =========================================================================================== -->
    <!-- = The following is to support the legacy approach for inventory-items without components. = -->
    <!-- =========================================================================================== -->
    <!-- This is "model" in the context of a component -->
    <enum value="hardware-model">The model number of the hardware used by the asset.</enum>
    <!-- This is "name" in the context of a component -->
    <enum value="os-name">The name of the operating system used by the asset.</enum>
    <!-- This is "version" in the context of a component -->
    <enum value="os-version">The version of the operating system used by the asset.</enum>
    <!-- This is "name" in the context of a component -->
    <enum value="software-name">The software product name used by the asset.</enum>
    <!-- This is "version" in the context of a component -->
    <enum value="software-version">The software product version used by the asset.</enum>
    <!-- This is "patch-level" in the context of a component -->
    <enum value="software-patch-level">The software product patch level used by the asset.</enum>

    <!-- =========================================================================================== -->
    <!-- = The following is shared with system-component. = -->
    <!-- =========================================================================================== -->
    &allowed-values-component_inventory-item_property-name;

</allowed-values>
<allowed-values target="prop[@name='asset-type']/@value">
    &allowed-values-property-name-asset-type-values;
</allowed-values>

<allowed-values target="(.)[@type=('software', 'hardware', 'service')]/prop/@name" allow-other="yes">
    <enum value="vendor-name">The name of the company or organization </enum>
</allowed-values>


<allowed-values target="prop[@name='is-scanned']/@value">
    <enum value="yes">The asset is included in periodic vulnerability scanning.</enum>
    <enum value="no">The asset is not included in periodic vulnerability scanning.</enum>
</allowed-values>

<allowed-values target="link/@rel" allow-other="yes">
    <enum value="baseline-template">A reference to the baseline template used to configure the asset.</enum>
</allowed-values>
<!-- TODO: constrain link href values based on rel ((BJR): Was unsure how to do this.) -->

<allowed-values target="responsible-party/@role-id" allow-other="yes">
&allowed-values-responsible-roles-operations;
&allowed-values-responsible-roles-component-production;
</allowed-values>

<index-has-key name="index-metadata-role-id" target="responsible-party">
    <key-field target="@role-id"></key-field>
</index-has-key>
<index-has-key name="index-metadata-party-uuid" target="responsible-party">
    <key-field target="party-uuid"></key-field>
</index-has-key>
<is-unique id="unique-inventory-item-responsible-party" target="responsible-party">
    <key-field target="@role-id"/>
    <remarks>
          <p>Since <code>responsible-party</code> associates multiple <code>party-uuid</code> entries with a single <code>role-id</code>, each role-id must be referenced only once.</p>
    </remarks>
</is-unique>
</constraint>

<enum xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0" value="asset-type">Simple indication of the asset's function, such as Router, Storage Array, DNS Server.</enum>
<enum xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0" value="asset-id">An organizationally specific identifier that is used to uniquely identify a logical or tangible item by the organization that owns the item.</enum>
<enum xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0" value="asset-tag">An asset tag assigned by the organization responsible for maintaining the logical or tangible item.</enum>
<enum xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0" value="public">Identifies whether the asset is publicly accessible (yes/no)</enum>
<enum xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0" value="virtual">Identifies whether the asset is virtualized (yes/no)</enum>
<enum xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0" value="vlan-id">Virtual LAN identifier of the asset.</enum>
<enum xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0" value="network-id">The network identifier of the asset.</enum>
<enum xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0" value="label">A human-readable label for the parent context.</enum>
<enum xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0" value="sort-id">An alternative identifier, whose value is easily sortable among other such values in the document.</enum>
<enum xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0" value="baseline-configuration-name">The name of the baseline configuration for the asset.</enum>
<enum xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0" value="allows-authenticated-scan">Can the asset be check with an authenticated scan? (yes/no)</enum>
<enum xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0" value="function">The function provided by the asset for the system.</enum>




Define public accessibility. Inherently, no individual assets of a CSP are acessible. 
<enum xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0" value="public">Identifies whether the asset is publicly accessible (yes/no)</enum>


Define virtual. Load balanced session?
<enum xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0" value="virtual">Identifies whether the asset is virtualized (yes/no)</enum>

NIST needs to eliminate these fields / definition constraints for attribute fields. 



"users": [
{
  "uuid": "9cb0fab0-78bd-44ba-bcb8-3e9801cc952f",
  "title": "[SAMPLE]Unix System Administrator",
  "props": [
    {
      "name": "sensitivity",
      "ns": "https://fedramp.gov/ns/oscal",
      "value": "high"
    },
    {
      "name": "privilege-level",
      "value": "privileged"
    },
    {
      "name": "type",
      "value": "internal"
    }
  ],
  "role-ids": [
    "admin-unix"
  ],
  "authorized-privileges": [
    {
      "title": "Full administrative access (root)",
      "functions-performed": [
        "Add/remove users and hardware",
        "install and configure software",
        "OS updates, patches and hotfixes",
        "perform backups"
      ]
    }
  ]
},

component


oscal inventory example
{
"uuid": "779d4e89-bba6-432c-b50d-d699fe534129",
"description": "None.",
"props": [
  {
    "name": "asset-id",
    "value": "unique-asset-id"
  },
  {
    "name": "ipv4-address",
    "value": "10.5.5.5"
  },
  {
    "name": "is-scanned",
    "value": "yes"
  }
],
"implemented-components": [
  {
    "component-uuid": "8f230d84-2f9b-44a3-acdb-019566ab2554"
  }
]
},

*/