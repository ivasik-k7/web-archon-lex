import React from 'react';
import type { PowerOfAttorneyData } from '../../types/documents';
import {
    formatDatePL,
    validatePesel,
} from '../../shared/utils';

interface PowerOfAttorneyPreviewProps {
    data: PowerOfAttorneyData;
    logoSrc?: string;
    variant?: 'default' | 'print';
}

export const PowerOfAttorneyPreview: React.FC<PowerOfAttorneyPreviewProps> = ({
    data,
    logoSrc,
    variant = 'default',
}) => {
    const principalPeselValid = data.principalPesel ? validatePesel(data.principalPesel).isValid : false;
    const attorneyPeselValid = data.attorneyPesel ? validatePesel(data.attorneyPesel).isValid : false;

    const powerTypeLabels = {
        general: 'ogólne',
        specific: 'szczególne',
        special: 'rodzajowe',
    };

    const powerTypeLabel = powerTypeLabels[data.powerType] || data.powerType;
    const issueDateFormatted = formatDatePL(data.issueDate);
    const expiryDateFormatted = formatDatePL(data.expiryDate);
    const notaryDateFormatted = formatDatePL(data.notaryDate);

    return (
        <div
            className={`
        contract-preview bg-white
        ${variant === 'print' ? 'p-[2cm]' : 'p-[30px] shadow-card'}
      `}
            style={{
                minHeight: '297mm',
                fontFamily: '"Times New Roman", Times, serif',
                fontSize: '11pt',
                lineHeight: 1.5,
                position: 'relative',
            }}
        >
            {/* Watermark Logo */}
            {logoSrc && (
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) rotate(-45deg)',
                        opacity: 0.07,
                        zIndex: 1,
                        pointerEvents: 'none',
                        width: '80%',
                        textAlign: 'center',
                    }}
                >
                    <img
                        src={logoSrc}
                        alt="Watermark"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '200px',
                            filter: 'grayscale(100%)',
                        }}
                    />
                </div>
            )}

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px', position: 'relative', zIndex: 2 }}>
                <h1 style={{
                    fontSize: '18pt',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '8px',
                    color: '#1e1e1e',
                    borderBottom: '2px solid #7c6a3e',
                    paddingBottom: '12px',
                }}>
                    PEŁNOMOCNICTWO {powerTypeLabel.toUpperCase()}
                </h1>
                {data.documentNumber && (
                    <div style={{
                        fontSize: '10pt',
                        color: '#7c6a3e',
                        fontWeight: 600,
                        marginTop: '4px',
                        fontFamily: 'monospace',
                    }}>
                        Nr: {data.documentNumber}
                    </div>
                )}
            </div>

            {/* Introduction */}
            <div style={{ marginBottom: '16px', position: 'relative', zIndex: 2 }}>
                <p>
                    Sporządzone w dniu <strong>{issueDateFormatted || '__.__.____'}</strong> r.,
                    w <strong>{data.place || '________________'}</strong>.
                </p>
            </div>

            {/* Principal */}
            <div style={{ marginBottom: '16px', position: 'relative', zIndex: 2 }}>
                <p style={{ textAlign: 'justify' }}>
                    Ja, niżej podpisany/a{' '}
                    <strong>{data.principalFullName || '____________________'}</strong>,
                    {data.principalBirthDate && data.principalBirthPlace ? (
                        <> urodzony/a dnia <strong>{formatDatePL(data.principalBirthDate)}</strong> r. w <strong>{data.principalBirthPlace}</strong>,</>
                    ) : data.principalBirthDate ? (
                        <> urodzony/a dnia <strong>{formatDatePL(data.principalBirthDate)}</strong> r.,</>
                    ) : data.principalBirthPlace ? (
                        <> urodzony/a w <strong>{data.principalBirthPlace}</strong>,</>
                    ) : null}
                    {' '}zamieszkały/a: <strong>{data.principalAddress || '____________________'}</strong>,
                </p>
                <p style={{ marginTop: '4px', textAlign: 'justify' }}>
                    PESEL: <strong>{data.principalPesel || '________________'}</strong>
                    {!principalPeselValid && data.principalPesel && (
                        <span style={{
                            marginLeft: '8px',
                            color: '#c62828',
                            fontSize: '9pt',
                            fontStyle: 'italic',
                        }}>
                            (niezweryfikowany)
                        </span>
                    )}
                    {data.principalIdCard && (
                        <>, dowód osobisty: <strong>{data.principalIdCard}</strong></>
                    )}
                </p>
            </div>

            {/* Power of Attorney Grant */}
            <div style={{ marginBottom: '16px', position: 'relative', zIndex: 2 }}>
                <p style={{ textAlign: 'justify' }}>
                    niniejszym udzielam pełnomocnictwa{' '}
                    <strong style={{ textTransform: 'lowercase' }}>{powerTypeLabel}</strong>
                </p>
            </div>

            {/* Attorney */}
            <div style={{ marginBottom: '16px', position: 'relative', zIndex: 2 }}>
                <p style={{ textAlign: 'justify' }}>
                    Panu/Pani <strong>{data.attorneyFullName || '____________________'}</strong>,
                    {data.attorneyBirthDate && data.attorneyBirthPlace ? (
                        <> urodzonemu/a dnia <strong>{formatDatePL(data.attorneyBirthDate)}</strong> r. w <strong>{data.attorneyBirthPlace}</strong>,</>
                    ) : data.attorneyBirthDate ? (
                        <> urodzonemu/a dnia <strong>{formatDatePL(data.attorneyBirthDate)}</strong> r.,</>
                    ) : data.attorneyBirthPlace ? (
                        <> urodzonemu/a w <strong>{data.attorneyBirthPlace}</strong>,</>
                    ) : null}
                    {' '}zamieszkałemu/a: <strong>{data.attorneyAddress || '____________________'}</strong>,
                </p>
                <p style={{ marginTop: '4px', textAlign: 'justify' }}>
                    PESEL: <strong>{data.attorneyPesel || '________________'}</strong>
                    {!attorneyPeselValid && data.attorneyPesel && (
                        <span style={{
                            marginLeft: '8px',
                            color: '#c62828',
                            fontSize: '9pt',
                            fontStyle: 'italic',
                        }}>
                            (niezweryfikowany)
                        </span>
                    )}
                    {data.attorneyIdCard && (
                        <>, dowód osobisty: <strong>{data.attorneyIdCard}</strong></>
                    )}
                </p>
            </div>

            {/* Additional Attorneys */}
            {data.jointRepresentation && data.additionalAttorneys && data.additionalAttorneys.length > 0 && (
                <div style={{ marginBottom: '16px', position: 'relative', zIndex: 2 }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                        Współpełnomocnicy działający łącznie:
                    </p>
                    {data.additionalAttorneys.map((attorney, index) => (
                        <div key={index} style={{ marginBottom: '12px', paddingLeft: '16px' }}>
                            <p style={{ textAlign: 'justify' }}>
                                <strong>{index + 1}. {attorney.fullName}</strong>,
                                zam. {attorney.address},
                                PESEL: {attorney.pesel}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Scope */}
            <div style={{ marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                <h2 style={{
                    fontSize: '12pt',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    marginTop: '16px',
                    color: '#3a3a3a',
                    borderBottom: '1px solid #d4d4d4',
                    paddingBottom: '4px',
                }}>
                    Zakres umocowania
                </h2>
                <p style={{
                    marginBottom: '8px',
                    paddingLeft: '16px',
                    borderLeft: '2px solid #7c6a3e',
                    textAlign: 'justify',
                    whiteSpace: 'pre-wrap',
                }}>
                    {data.scopeDescription || '____________________'}
                </p>

                {data.canSubstitute && (
                    <p style={{ marginTop: '8px', textAlign: 'justify' }}>
                        <strong>Pełnomocnik ma prawo do ustanawiania substytutów.</strong>
                        {data.substitutionLimit && (
                            <> Ograniczenie: {data.substitutionLimit}.</>
                        )}
                    </p>
                )}
            </div>

            {/* Revocability */}
            <div style={{ marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                <h2 style={{
                    fontSize: '12pt',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    marginTop: '16px',
                    color: '#3a3a3a',
                    borderBottom: '1px solid #d4d4d4',
                    paddingBottom: '4px',
                }}>
                    Postanowienia końcowe
                </h2>

                <p style={{ marginBottom: '8px', textAlign: 'justify' }}>
                    1. Pełnomocnictwo jest {data.isRevocable ? 'odwołalne' : 'nieodwołalne'}.
                    {data.expiryDate && (
                        <> Wygasa z dniem <strong>{expiryDateFormatted}</strong> r.</>
                    )}
                </p>
            </div>

            {/* Notarial Confirmation */}
            {data.isNotarized && (
                <div style={{
                    marginBottom: '20px',
                    position: 'relative',
                    zIndex: 2,
                    border: '1px solid #7c6a3e',
                    padding: '16px',
                    backgroundColor: '#fcf8e7',
                }}>
                    <h2 style={{
                        fontSize: '12pt',
                        fontWeight: 'bold',
                        marginBottom: '12px',
                        color: '#7c6a3e',
                        textAlign: 'center',
                    }}>
                        POŚWIADCZENIE NOTARIALNE
                    </h2>

                    <p style={{ marginBottom: '8px', textAlign: 'center' }}>
                        {data.notaryOffice ? (
                            <>Przed notariuszem {data.notaryOffice}</>
                        ) : (
                            '____________________'
                        )}
                    </p>

                    {data.notaryActNumber && (
                        <p style={{ marginBottom: '8px', textAlign: 'center' }}>
                            Repertorium A nr {data.notaryActNumber}
                        </p>
                    )}

                    {data.notaryDate && (
                        <p style={{ marginBottom: '8px', textAlign: 'center' }}>
                            Sporządzone dnia {notaryDateFormatted} r.
                        </p>
                    )}

                    <div style={{ height: '60px', borderTop: '1px dashed #7c6a3e', marginTop: '16px' }} />
                    <p style={{ marginTop: '8px', fontSize: '9pt', textAlign: 'center', fontStyle: 'italic' }}>
                        (miejsce na podpis i pieczęć notariusza)
                    </p>
                </div>
            )}

            {/* Additional Clauses */}
            {data.additionalClauses && data.additionalClauses.length > 0 && (
                <div style={{ marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                    <h2 style={{
                        fontSize: '12pt',
                        fontWeight: 'bold',
                        marginBottom: '8px',
                        marginTop: '16px',
                        color: '#3a3a3a',
                        borderBottom: '1px solid #d4d4d4',
                        paddingBottom: '4px',
                    }}>
                        Klauzule dodatkowe
                    </h2>
                    {data.additionalClauses.map((clause, index) => (
                        <p key={index} style={{ marginBottom: '4px', textAlign: 'justify' }}>
                            {index + 1}. {clause}
                        </p>
                    ))}
                </div>
            )}

            {/* Signature */}
            <div style={{
                marginTop: '48px',
                marginBottom: '24px',
                position: 'relative',
                zIndex: 2,
                width: '50%',
            }}>
                <div style={{ height: '60px' }}></div>
                <div style={{
                    borderTop: '1px solid #1e1e1e',
                    paddingTop: '8px',
                    marginTop: '40px',
                    fontSize: '10pt',
                    textAlign: 'center',
                }}>
                    <strong>Mocodawca</strong>
                    <br />
                    {data.principalFullName && (
                        <span style={{ fontSize: '9pt', color: '#666' }}>
                            ({data.principalFullName})
                        </span>
                    )}
                </div>
            </div>

            {/* Print footer */}
            {variant === 'print' && (
                <div style={{
                    marginTop: '32px',
                    fontSize: '8pt',
                    color: '#6c6c6c',
                    textAlign: 'center',
                    borderTop: '1px dashed #d4d4d4',
                    paddingTop: '16px',
                    position: 'relative',
                    zIndex: 2,
                }}>
                    <p>
                        Dokument wygenerowany elektronicznie w systemie ArchonLex w dniu{' '}
                        {formatDatePL(new Date().toISOString())} r.
                        Ważny bez podpisu odręcznego.
                    </p>
                </div>
            )}
        </div>
    );
};

export default PowerOfAttorneyPreview;