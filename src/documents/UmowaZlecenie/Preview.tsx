import React from 'react';
import type { UmowaZlecenieData } from '../../types/documents';
import {
    numberToWords,
    formatCurrency,
    formatDatePL,
    validatePesel,
    validateNIP,
    validateIBAN,
} from '../../shared/utils';

// ============================================================================
// TYPES
// ============================================================================

interface UmowaZleceniePreviewProps {
    data: UmowaZlecenieData;
    variant?: 'default' | 'compact' | 'print';
    showWatermark?: boolean;
}

// ============================================================================
// STYLES - In production, these would be in a separate CSS file
// ============================================================================

const styles = {
    container: {
        fontFamily: '"Times New Roman", Times, serif',
        fontSize: '11pt',
        lineHeight: 1.5,
        color: '#1e1e1e',
        backgroundColor: '#ffffff',
        padding: '2.5rem',
        maxWidth: '210mm',
        margin: '0 auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        position: 'relative' as const,
    },
    printContainer: {
        fontFamily: '"Times New Roman", Times, serif',
        fontSize: '12pt',
        lineHeight: 1.5,
        color: '#000000',
        padding: '1.5cm',
        maxWidth: '100%',
        margin: '0',
        boxShadow: 'none',
    },
    header: {
        textAlign: 'center' as const,
        marginBottom: '24px',
    },
    title: {
        fontSize: '18pt',
        fontWeight: 'bold',
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
        marginBottom: '8px',
        color: '#1e1e1e',
        borderBottom: '2px solid #7c6a3e',
        paddingBottom: '12px',
    },
    contractNumber: {
        fontSize: '10pt',
        color: '#7c6a3e',
        fontWeight: 600,
        marginTop: '4px',
    },
    section: {
        marginBottom: '20px',
    },
    sectionTitle: {
        fontSize: '12pt',
        fontWeight: 'bold',
        marginBottom: '8px',
        marginTop: '16px',
        color: '#3a3a3a',
        borderBottom: '1px solid #d4d4d4',
        paddingBottom: '4px',
    },
    paragraph: {
        marginBottom: '8px',
        textAlign: 'justify' as const,
    },
    indent: {
        paddingLeft: '24px',
        marginBottom: '8px',
    },
    signatureContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '48px',
        marginBottom: '24px',
    },
    signatureBox: {
        width: '45%',
    },
    signatureLine: {
        borderTop: '1px solid #1e1e1e',
        paddingTop: '8px',
        marginTop: '40px',
        fontSize: '10pt',
        textAlign: 'center' as const,
    },
    watermark: {
        position: 'absolute' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-45deg)',
        fontSize: '48pt',
        color: 'rgba(124, 106, 62, 0.03)',
        fontWeight: 'bold',
        textTransform: 'uppercase' as const,
        pointerEvents: 'none' as const,
        whiteSpace: 'nowrap' as const,
        zIndex: 1,
    },
    highlight: {
        backgroundColor: '#fcf8e7',
        padding: '12px',
        borderRadius: '4px',
        borderLeft: '4px solid #7c6a3e',
        marginBottom: '16px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse' as const,
        marginBottom: '16px',
    },
    tableCell: {
        border: '1px solid #e0e0e0',
        padding: '8px',
        textAlign: 'left' as const,
        verticalAlign: 'top' as const,
    },
    tableHeader: {
        backgroundColor: '#f5f5f5',
        fontWeight: 'bold',
    },
    footer: {
        marginTop: '32px',
        fontSize: '8pt',
        color: '#6c6c6c',
        textAlign: 'center' as const,
        borderTop: '1px dashed #d4d4d4',
        paddingTop: '16px',
    },
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const ValidationBadge: React.FC<{ isValid: boolean; type: 'nip' | 'pesel' | 'iban' }> = ({ isValid, type }) => {
    const labels = {
        nip: 'NIP',
        pesel: 'PESEL',
        iban: 'rachunek',
    };

    return (
        <span
            style={{
                display: 'inline-block',
                padding: '2px 8px',
                marginLeft: '8px',
                fontSize: '8pt',
                fontWeight: 'normal',
                backgroundColor: isValid ? '#e6f7e6' : '#ffe6e6',
                color: isValid ? '#2e7d32' : '#c62828',
                borderRadius: '12px',
                border: `1px solid ${isValid ? '#a5d6a7' : '#ef9a9a'}`,
            }}
        >
            {labels[type]}: {isValid ? '✔ zweryfikowany' : '✗ niezweryfikowany'}
        </span>
    );
};

const FieldPlaceholder: React.FC<{ value: string; fallback: string }> = ({ value, fallback }) => {
    if (!value || value.trim() === '') {
        return (
            <span
                style={{
                    color: '#999',
                    fontStyle: 'italic',
                    borderBottom: '1px dashed #ccc',
                    padding: '0 4px',
                }}
            >
                {fallback}
            </span>
        );
    }
    return <span style={{ fontWeight: 500 }}>{value}</span>;
};

// ============================================================================
// MAIN PREVIEW COMPONENT
// ============================================================================

export const UmowaZleceniePreview: React.FC<UmowaZleceniePreviewProps> = ({
    data,
    variant = 'default',
    showWatermark = false,
}) => {
    // ==========================================================================
    // Computed values
    // ==========================================================================

    const wynagrodzenie = parseFloat(data.wynagrodzenie?.replace(',', '.') || '0') || 0;
    const vatRate = parseInt(data.vat_rate || '23');
    const vatAmount = wynagrodzenie * (vatRate / 100);
    const wynagrodzenieBrutto = wynagrodzenie + vatAmount;

    const peselValidation = data.zleceniobiorca_pesel ? validatePesel(data.zleceniobiorca_pesel) : null;
    const nipValidation = data.zleceniodawca_nip ? validateNIP(data.zleceniodawca_nip) : null;
    const ibanValidation = data.platnosc_konto ? validateIBAN(data.platnosc_konto) : null;

    const isPeselValid = peselValidation?.isValid ?? false;
    const isNipValid = nipValidation?.isValid ?? false;
    const isIbanValid = ibanValidation?.isValid ?? false;

    const contractDate = formatDatePL(data.data);
    const executionDate = formatDatePL(data.data_wykonania);
    const paymentDate = formatDatePL(data.platnosc_termin);

    // Extract city from address or use miejsce
    const getCity = () => {
        if (data.miejsce) return data.miejsce;
        const cityMatch = data.zleceniodawca_adres?.match(/(\d{2}-\d{3})\s+([^,]+)$/);
        return cityMatch?.[2] || 'Warszawa';
    };

    const formatFullAddress = (address: string) => {
        if (!address) return '____________________';
        return address;
    };

    // ==========================================================================
    // Style selector
    // ==========================================================================

    const containerStyle = variant === 'print' ? styles.printContainer : styles.container;

    // ==========================================================================
    // Render
    // ==========================================================================

    return (
        <div style={containerStyle} className={`contract-preview contract-preview-${variant}`}>
            {/* Watermark */}
            {showWatermark && (
                <div style={styles.watermark}>
                    {data.numer_umowy ? `UMOWA ${data.numer_umowy}` : 'PROJEKT UMOWY'}
                </div>
            )}

            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.title}>UMOWA ZLECENIE</h1>
                {data.numer_umowy && (
                    <div style={styles.contractNumber}>
                        Nr: <strong>{data.numer_umowy}</strong>
                        {variant === 'print' && (
                            <span style={{ marginLeft: '16px', fontWeight: 'normal', color: '#666' }}>
                                Data wydruku: {formatDatePL(new Date().toISOString())}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Introduction */}
            <div style={styles.paragraph}>
                Umowa zawarta w dniu{' '}
                <strong>
                    <FieldPlaceholder value={data.data} fallback="__.__.____" />
                </strong>{' '}
                r., w <strong>{getCity() || '________________'}</strong>, pomiędzy:
            </div>

            {/* Zleceniodawca Section */}
            <div style={styles.indent}>
                <p style={styles.paragraph}>
                    <strong style={{ fontSize: '12pt' }}>Zleceniodawcą:</strong>
                </p>
                <p style={styles.paragraph}>
                    <FieldPlaceholder
                        value={data.zleceniodawca_nazwa}
                        fallback="[nazwa zleceniodawcy]"
                    />
                    , z siedzibą:{' '}
                    <FieldPlaceholder
                        value={data.zleceniodawca_adres}
                        fallback="[adres]"
                    />
                </p>

                {(data.zleceniodawca_nip || data.zleceniodawca_regon) && (
                    <p style={styles.paragraph}>
                        {data.zleceniodawca_nip && (
                            <>
                                NIP: <strong>{data.zleceniodawca_nip}</strong>
                                {nipValidation && <ValidationBadge isValid={isNipValid} type="nip" />}
                            </>
                        )}
                        {data.zleceniodawca_nip && data.zleceniodawca_regon && ', '}
                        {data.zleceniodawca_regon && (
                            <>
                                REGON: <strong>{data.zleceniodawca_regon}</strong>
                            </>
                        )}
                    </p>
                )}

                {data.zleceniodawca_repr ? (
                    <p style={styles.paragraph}>
                        reprezentowanym przez: <strong>{data.zleceniodawca_repr}</strong>
                    </p>
                ) : (
                    <p style={{ ...styles.paragraph, fontStyle: 'italic', color: '#666' }}>
                        działającym samodzielnie
                    </p>
                )}

                <p style={{ ...styles.paragraph, fontStyle: 'italic', marginTop: '4px' }}>
                    zwanym dalej <strong>Zleceniodawcą</strong>
                </p>
            </div>

            {/* Zleceniobiorca Section */}
            <div style={styles.indent}>
                <p style={styles.paragraph}>
                    <strong style={{ fontSize: '12pt' }}>Zleceniobiorcą:</strong>
                </p>
                <p style={styles.paragraph}>
                    <FieldPlaceholder
                        value={data.zleceniobiorca_imie}
                        fallback="[imię i nazwisko]"
                    />
                    , zamieszkałym:{' '}
                    <FieldPlaceholder
                        value={data.zleceniobiorca_adres}
                        fallback="[adres]"
                    />
                </p>

                {data.zleceniobiorca_pesel && (
                    <p style={styles.paragraph}>
                        PESEL: <strong>{data.zleceniobiorca_pesel}</strong>
                        {peselValidation && (
                            <>
                                <ValidationBadge isValid={isPeselValid} type="pesel" />
                                {peselValidation.birthDate && (
                                    <span style={{ marginLeft: '8px', color: '#666', fontSize: '9pt' }}>
                                        (ur. {formatDatePL(peselValidation.birthDate.toISOString())})
                                    </span>
                                )}
                            </>
                        )}
                    </p>
                )}

                {data.zleceniobiorca_dowod && (
                    <p style={styles.paragraph}>
                        Dowód osobisty: <strong>{data.zleceniobiorca_dowod}</strong>
                    </p>
                )}

                {(data.zleceniobiorca_telefon || data.zleceniobiorca_email) && (
                    <p style={{ ...styles.paragraph, fontSize: '10pt', color: '#666' }}>
                        {data.zleceniobiorca_telefon && `tel: ${data.zleceniobiorca_telefon}`}
                        {data.zleceniobiorca_telefon && data.zleceniobiorca_email && ' • '}
                        {data.zleceniobiorca_email && `email: ${data.zleceniobiorca_email}`}
                    </p>
                )}

                <p style={{ ...styles.paragraph, fontStyle: 'italic', marginTop: '4px' }}>
                    zwanym dalej <strong>Zleceniobiorcą</strong>
                </p>
            </div>

            {/* Przedmiot umowy */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>§ 1. Przedmiot umowy</h2>

                <p style={styles.paragraph}>
                    1. Zleceniodawca zleca, a Zleceniobiorca zobowiązuje się do osobistego wykonania
                    następujących czynności:
                </p>

                <div
                    style={{
                        ...styles.indent,
                        backgroundColor: data.opis_uslugi ? '#fafafa' : 'transparent',
                        padding: '12px',
                        borderRadius: '4px',
                        borderLeft: data.opis_uslugi ? '3px solid #7c6a3e' : 'none',
                        marginTop: '8px',
                        marginBottom: '8px',
                        minHeight: '60px',
                    }}
                >
                    {data.opis_uslugi ? (
                        <p style={{ ...styles.paragraph, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                            {data.opis_uslugi}
                        </p>
                    ) : (
                        <p style={{ ...styles.paragraph, color: '#999', fontStyle: 'italic' }}>
                            [ szczegółowy opis czynności do wykonania ]
                        </p>
                    )}
                </div>

                {data.data_wykonania && (
                    <p style={styles.paragraph}>
                        2. Termin wykonania zlecenia: <strong>{executionDate}</strong> r.
                        {new Date(data.data_wykonania) < new Date(data.data) && (
                            <span style={{ color: '#c62828', marginLeft: '8px', fontSize: '9pt' }}>
                                ⚠ Termin wykonania przed datą zawarcia umowy
                            </span>
                        )}
                    </p>
                )}

                <p style={styles.paragraph}>
                    3. Zleceniobiorca zobowiązuje się do wykonywania zleconych czynności z zachowaniem
                    należytej staranności, zgodnie z obowiązującymi przepisami prawa oraz wskazaniami
                    Zleceniodawcy.
                </p>
            </div>

            {/* Wynagrodzenie */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>§ 2. Wynagrodzenie</h2>

                {wynagrodzenie > 0 ? (
                    <>
                        <p style={styles.paragraph}>
                            1. Za należyte wykonanie przedmiotu umowy Strony ustalają wynagrodzenie w wysokości:
                        </p>

                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ ...styles.tableCell, ...styles.tableHeader }}>Wyszczególnienie</th>
                                    <th style={{ ...styles.tableCell, ...styles.tableHeader }}>Kwota</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={styles.tableCell}>Wynagrodzenie netto</td>
                                    <td style={{ ...styles.tableCell, fontWeight: 'bold' }}>
                                        {formatCurrency(wynagrodzenie)} zł
                                    </td>
                                </tr>
                                <tr>
                                    <td style={styles.tableCell}>VAT ({vatRate}%)</td>
                                    <td style={styles.tableCell}>{formatCurrency(vatAmount)} zł</td>
                                </tr>
                                <tr style={{ backgroundColor: '#f9f9f9' }}>
                                    <td style={{ ...styles.tableCell, fontWeight: 'bold' }}>Wynagrodzenie brutto</td>
                                    <td style={{ ...styles.tableCell, fontWeight: 'bold', color: '#7c6a3e' }}>
                                        {formatCurrency(wynagrodzenieBrutto)} zł
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <p style={styles.paragraph}>
                            <span style={{ fontWeight: 'bold' }}>słownie:</span>{' '}
                            <span style={{ fontStyle: 'italic' }}>
                                {numberToWords(wynagrodzenieBrutto)}
                            </span>
                        </p>
                    </>
                ) : (
                    <p style={{ ...styles.paragraph, color: '#999', fontStyle: 'italic' }}>
                        [ wynagrodzenie nie zostało określone ]
                    </p>
                )}

                {data.platnosc_konto && (
                    <p style={styles.paragraph}>
                        2. Wynagrodzenie zostanie wypłacone przelewem na rachunek bankowy:
                        <br />
                        <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '11pt' }}>
                            {data.platnosc_konto}
                        </span>
                        {ibanValidation && (
                            <>
                                <ValidationBadge isValid={isIbanValid} type="iban" />
                                {ibanValidation.bankName && (
                                    <span style={{ marginLeft: '8px', color: '#666', fontSize: '9pt' }}>
                                        ({ibanValidation.bankName})
                                    </span>
                                )}
                            </>
                        )}
                    </p>
                )}

                {data.platnosc_termin && (
                    <p style={styles.paragraph}>
                        3. Termin płatności: <strong>{paymentDate}</strong> r.
                    </p>
                )}
            </div>

            {/* Obowiązki i odpowiedzialność */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>§ 3. Obowiązki i odpowiedzialność</h2>

                <p style={styles.paragraph}>
                    1. Zleceniobiorca zobowiązuje się do osobistego wykonania zlecenia. Powierzenie wykonania
                    zlecenia osobie trzeciej wymaga pisemnej zgody Zleceniodawcy.
                </p>

                <p style={styles.paragraph}>
                    2. Zleceniobiorca ponosi odpowiedzialność za szkody wyrządzone Zleceniodawcy wskutek
                    niewykonania lub nienależytego wykonania przedmiotu umowy.
                </p>

                <p style={styles.paragraph}>
                    3. Zleceniodawca zobowiązuje się do współpracy z Zleceniobiorcą oraz do przekazania mu
                    wszelkich informacji i materiałów niezbędnych do prawidłowego wykonania umowy.
                </p>
            </div>

            {/* Postanowienia końcowe */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>§ 4. Postanowienia końcowe</h2>

                <p style={styles.paragraph}>
                    1. Wszelkie zmiany umowy wymagają formy pisemnej pod rygorem nieważności.
                </p>

                <p style={styles.paragraph}>
                    2. W sprawach nieuregulowanych niniejszą umową mają zastosowanie przepisy Kodeksu
                    cywilnego oraz innych obowiązujących ustaw.
                </p>

                <p style={styles.paragraph}>
                    3. Umowa została sporządzona w dwóch jednobrzmiących egzemplarzach, po jednym dla każdej
                    ze stron.
                </p>

                {data.dodatkowe_klauzule && data.dodatkowe_klauzule.length > 0 && (
                    <div style={styles.highlight}>
                        <p style={{ ...styles.paragraph, fontWeight: 'bold', marginBottom: '4px' }}>
                            Klauzule dodatkowe:
                        </p>
                        {data.dodatkowe_klauzule.map((klauzula, index) => (
                            <p key={index} style={{ ...styles.paragraph, marginBottom: '4px' }}>
                                {index + 1}. {klauzula}
                            </p>
                        ))}
                    </div>
                )}
            </div>

            {/* Podpisy */}
            <div style={styles.signatureContainer}>
                <div style={styles.signatureBox}>
                    <div style={{ height: '60px' }}></div>
                    <div style={styles.signatureLine}>
                        <strong>Zleceniodawca</strong>
                        <br />
                        {data.zleceniodawca_repr && (
                            <span style={{ fontSize: '9pt', color: '#666' }}>({data.zleceniodawca_repr})</span>
                        )}
                    </div>
                </div>

                <div style={styles.signatureBox}>
                    <div style={{ height: '60px' }}></div>
                    <div style={styles.signatureLine}>
                        <strong>Zleceniobiorca</strong>
                        <br />
                        {data.zleceniobiorca_imie && (
                            <span style={{ fontSize: '9pt', color: '#666' }}>({data.zleceniobiorca_imie})</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            {variant === 'print' && (
                <div style={styles.footer}>
                    <p>
                        Dokument wygenerowany elektronicznie w systemie ArchonLex w dniu{' '}
                        {formatDatePL(new Date().toISOString())} r. Ważny bez podpisu odręcznego.
                    </p>
                </div>
            )}

            {/* Validation Summary for draft mode */}
            {variant === 'default' && (
                <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                    <p style={{ fontSize: '9pt', color: '#666', marginBottom: '8px' }}>
                        <strong>Status dokumentu:</strong>{' '}
                        {data.numer_umowy && data.zleceniobiorca_imie && data.opis_uslugi && wynagrodzenie > 0
                            ? '✅ Gotowy do wydruku'
                            : '⏳ Wymaga uzupełnienia'}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        {!data.numer_umowy && <span style={{ fontSize: '8pt', color: '#c62828' }}>• Brak numeru umowy</span>}
                        {!data.zleceniobiorca_imie && <span style={{ fontSize: '8pt', color: '#c62828' }}>• Brak danych zleceniobiorcy</span>}
                        {!data.opis_uslugi && <span style={{ fontSize: '8pt', color: '#c62828' }}>• Brak opisu usługi</span>}
                        {wynagrodzenie <= 0 && <span style={{ fontSize: '8pt', color: '#c62828' }}>• Brak określonego wynagrodzenia</span>}
                        {!isPeselValid && data.zleceniobiorca_pesel && <span style={{ fontSize: '8pt', color: '#ed6c02' }}>• PESEL wymaga weryfikacji</span>}
                        {!isNipValid && data.zleceniodawca_nip && <span style={{ fontSize: '8pt', color: '#ed6c02' }}>• NIP wymaga weryfikacji</span>}
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// PRINT STYLES COMPONENT
// ============================================================================

export const UmowaZleceniePrintStyles: React.FC = () => {
    React.useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        .contract-preview-print,
        .contract-preview-print * {
          visibility: visible;
        }
        .contract-preview-print {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          margin: 0;
          padding: 1.5cm;
          background: white;
          box-shadow: none;
        }
        .signature-line {
          border-top: 1px solid black !important;
        }
        @page {
          size: A4;
          margin: 2cm;
        }
      }
    `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return null;
};

// ============================================================================
// EXPORT
// ============================================================================

export default UmowaZleceniePreview;