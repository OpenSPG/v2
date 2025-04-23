import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function CooperationPartners() {
    const { siteConfig } = useDocusaurusContext();
    const partners = siteConfig.customFields.partners;

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Partner</h2>
            <h3> Ant Group × OpenKG </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
                {partners.map((partner, index) => (
                    <div
                        key={index}
                        style={{
                            border: '0px solid #ccc',
                            borderRadius: '18px',
                            padding: '10px',
                            flexBasis: 'calc(33.333% - 40px)',
                            textAlign: 'center',
                            margin: '10px',
                        }}
                    >
                        <div
                            style={{
                                padding: '10px',
                                borderRadius: '18px',
                                height: '100px',
                            }}
                        >
                            {partner.logo ? (
                                <img
                                    src={partner.logo}
                                    alt={`${partner.name} logo`}
                                    style={{ maxWidth: '240px', height: '60px', backgroundColor: partner.imageBackground || '#fff',position: 'relative',
                                        top: '50%',transform: 'translateY(-50%)',padding: '10px', borderRadius: '8px', }}
                                />
                            ) : (
                                <div style={{ color: '#bbb',}}>
                                    No Logo
                                </div>
                            )}
                        </div>

                        {partner.website ? (
                            <Link
                                to={partner.website}
                                style={{
                                    textDecoration: 'none',
                                    color: '#007bff',
                                    fontWeight: 'bold',
                                    display: 'block',
                                }}
                            >
                                {partner.name}
                            </Link>
                        ) : (
                            <div style={{ fontWeight: 'bold', color: '#333' }}>{partner.name}</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}